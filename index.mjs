import express from "express"
import Anthropic from '@anthropic-ai/sdk';
import cors from "cors"
import 'dotenv/config'


const PORT = 8080

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY, // This is the default and can be omitted
});

app.post("/api/get_recipe",async(req, res) => {
    const ingredients = req.body
    console.log(ingredients,"from end point")
    try {
        const data = await getRecipeFromChefClaude(ingredients)
        console.log(data, typeof(data))
        res.status(200).json({"recipe":data})

    }catch(err){
        console.log(err)
        res.status(500).json({"error":err})
    }
})


async function getRecipeFromChefClaude(ingredientsArr) {
    const SYSTEM_PROMPT = `
        You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
    `
    console.log(ingredientsArr, SYSTEM_PROMPT)
    if (ingredientsArr){
        const ingredientString = ingredientsArr.join(",")
        const message = await client.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: `I have ${ingredientString}. Please give me a recipe you'd recommend I make!` }],
        });
        console.log(message.content[0].text)

        return message.content[0].text
    }
    
}


app.listen(process.env.PORT || 8080,()=>{
    console.log(`express server at ${PORT}`)
})