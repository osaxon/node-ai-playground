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
                content: `You are tasked with extracting meta information from the following sentence: ${userPromptThree}. Format the output as a JSON object with properties for the scene, subject, objects and actions that are found in the sentence. The scene property should be a single string. the subject should be a single string. the objects should be an array of strings. the actions should be an array of strings. The response should not include anything other than the specified object and properties. First check for existing information in this object ${JSON.stringify(
                    imageContextFile
                )}. If any matching information matches values in this given object, the response object should be merged with this input object. If no matches are found, a new object should be produced as the response.`,
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
