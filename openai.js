import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config({ path: "./.env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// first prompt
const userPrompt =
    "a scuba diver encounters a large great white shark swimming near the rocks";

// this would be in the db
const contextOne = {
    scene: "near the rocks",
    subject: "scuba diver",
    objects: ["a large great white shark"],
    actions: ["encounters", "swimming"],
};

const userPromptTwo = `a giant squid appears from the depths of the ocean`;
const userPromptThree = `the shark flies away`;

async function main() {
    // lookup context file to pass to prompt
    console.log(userPromptThree, "<--- this user prompt");

    const imageContextFile = await fs.readFile("image-context.json");

    console.log(JSON.parse(imageContextFile), "<---- the context file");

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `Your task is to analyze the provided sentence: ${userPromptThree}, and extract meta information. Create a JSON object as the output with properties corresponding to the scene, subject, objects, and actions identified in the sentence. Ensure that the scene and subject are represented as single strings, while objects and actions are arrays of strings. Only include the specified properties in the response. Begin by checking for existing information in the following example context object: ${JSON.stringify(
                    imageContextFile
                )}. If any matching information aligns with values in this context object, merge the response object with the input object. In case no matches are found, generate a new object for the response.`,
            },
        ],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0], "<--- the response");

    const imageMetaObj = JSON.parse(completion.choices[0].message.content);

    console.log(imageMetaObj, "<--- the new image context");

    // write new context file / overwrite
    await fs.writeFile("image-context.json", JSON.stringify(imageMetaObj));

    // produce the image
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: `scene: ${imageMetaObj.scene} subject:${imageMetaObj.subject} objects:${imageMetaObj.objects} actions:${imageMetaObj.actions}`,
        n: 1,
        size: "1024x1024",
    });

    console.log(image, "<--- the image");
}

main();

// parse the users input and extract the meta information
// store the JSON in the DB
//
