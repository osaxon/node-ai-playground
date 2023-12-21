import Replicate from "replicate";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config({ path: "./.env.local" });

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

const userPrompt = "a bird flew from it's nest with a worm in its mouth";

const chatOutput = await replicate.run(
    "mistralai/mixtral-8x7b-instruct-v0.1:2b56576fcfbe32fa0526897d8385dd3fb3d36ba6fd0dbe033c72886b81ade93e",
    {
        input: {
            top_k: 50,
            top_p: 0.9,
            prompt: `You are tasked with extracting meta information from the following sentence: ${userPrompt}. Format the output as a JSON object with properties for the scene, subject, objects and actions that are found in the sentence. The scene property should be a single string. the subject should be a single string. the objects should be an array of strings. the actions should be an array of strings. The response should not include anything other than the specified object and properties.`,
            temperature: 0.6,
            max_new_tokens: 1024,
            prompt_template: "<s>[INST] {prompt} [/INST] ",
            presence_penalty: 0,
            frequency_penalty: 0,
        },
    }
);

const chatOutputObj = JSON.parse(chatOutput.join(""));
// await fs.writeFile("chatoutput.json", JSON.stringify(chatOutputObj));

console.log(chatOutputObj);

// const model =
//     "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
// const input = {
//     prompt: `generate an image with the following details. scene: ${chatOutputObj.scene} subject: ${chatOutputObj.subject} actions: ${chatOutputObj.actions} object: ${chatOutputObj.objects[0]}`,
//     num_outputs: 1,
// };

// const image = await replicate.run(model, { input });

// console.log(image);
