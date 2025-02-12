---
title: "Building RhetoricalRef: An AI-Powered Logical Fallacy Detector"
date: 2024-12-18
tags: [Python, AI, NLP, Machine Learning, Playwright]
description: "A technical exploration of building an AI-powered bot to detect and explain logical fallacies in social media posts using Python, multiple LLM models, and web automation."
---

# Introduction

In the age of social media, misinformation and flawed arguments can spread like wildfire. To help combat this, I developed RhetoricalRef - an AI-powered system that detects logical fallacies in social media posts and provides explanations and constructive feedback. 

The bot leverages multiple advanced language models including OpenAI's GPT-4, Anthropic's Claude, and Google's Gemini to analyze text, identify common logical fallacies, and generate human-like responses. It's built using Python and utilizes Playwright for web automation, enabling it to interact with social media platforms directly without relying on API limitations.

In this post, we'll take a deep technical dive into the architecture, key design decisions, and implementation details of this project. We'll also discuss challenges faced, their solutions, and potential future enhancements. Let's get started!

# Architecture and Design

Here's a high-level overview of the system architecture:

```
Playwright Browser <-> Web Controller <-> Fallacy Detector <-> LLM APIs
                          |                    |
                     SQLite DB          Multiple Models
                          |            (GPT-4/Claude/Gemini)
                    Results Dashboard
```

The key components are:

1. **Web Controller**: Uses Playwright to automate browser interactions, allowing the bot to read and respond to social media posts directly without API limitations.

2. **Fallacy Detector**: The core logic that preprocesses the text, coordinates between multiple LLM models for analysis, identifies fallacies through consensus, and generates explanations.

3. **Multiple LLM Models**: The system leverages GPT-4, Claude, and Gemini APIs for redundancy and improved accuracy. Each model analyzes the text independently, and their results are combined for more reliable fallacy detection.

4. **SQLite Database**: A lightweight, file-based relational database that stores the post data, detected fallacies, and bot responses for logging and analysis purposes.

5. **Results Dashboard**: A web interface that displays bot activity, detected fallacies, and generated responses, helping to monitor and improve the system's performance.

The design follows a modular architecture with multiple LLM models working in parallel. Each component operates independently, allowing for easy updates and improvements. The well-defined interfaces between components promote extensibility and maintainability, while enabling independent scaling or replacement of components as needed.

# Example Responses

Here are some examples of how RhetoricalRef detects and responds to different logical fallacies:

1. **Ad Hominem Fallacy**
   ```
   Original Post: "You can't trust their economic policy - they've never even run a business!"
   
   RhetoricalRef: I notice an ad hominem fallacy here. Instead of addressing the policy's merits, 
   the argument attacks the person's background. Let's focus on the policy details themselves 
   rather than personal characteristics.
   ```

2. **False Dichotomy**
   ```
   Original Post: "Either we completely ban AI, or we'll end up in a dystopian nightmare."
   
   RhetoricalRef: This appears to be a false dichotomy. There are many possible approaches to AI 
   regulation between total ban and no regulation. Complex issues often have multiple solutions 
   worth considering.
   ```

3. **Slippery Slope**
   ```
   Original Post: "If we allow remote work, soon everyone will be lazy and companies will fail!"
   
   RhetoricalRef: I've identified a slippery slope fallacy. This assumes a chain of negative 
   consequences without evidence. Many companies have successfully implemented remote work 
   without these dramatic outcomes.
   ```

4. **Appeal to Authority with Historical Comparison**
   ```
   Original Post: "As a CEO, I can tell you that this new law is just like 1984's dystopia."
   
   RhetoricalRef: Two issues here: 1) Appeal to authority - being a CEO doesn't automatically 
   make one an expert on legislation, and 2) Inappropriate historical comparison that 
   diminishes the seriousness of actual dystopian scenarios.
   ```

RhetoricalRef uses multiple AI models to analyze each post, requiring consensus before identifying a fallacy. This helps ensure accuracy and reduces false positives. The responses are designed to be educational and constructive, explaining the fallacy while encouraging better argumentation.

# Implementation Details

Let's dive into some key implementation specifics with code snippets.

## Fallacy Detection with GPT-3

The heart of the system is the `FallacyDetector` class. Here's a simplified version of the `detect_fallacies` method:

```python
def detect_fallacies(self, text: str) -> List[Dict[str, Any]]:
    prompt = f"""Analyze this text for logical fallacies:

"{text}"

Respond with a JSON array, where each object has keys "type", "explanation", and "confidence".
Use these fallacy types: {', '.join(self.fallacies.keys())}
Only identify clear fallacies; if none, return an empty array.

Output:"""

    response = self.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at detecting logical fallacies."},
            {"role": "user", "content": prompt}
        ]
    )
    
    result = response.choices[0].message.content.strip()
    fallacies = json.loads(result)
    return fallacies
```

Here, we construct a prompt with instructions for GPT-3 to analyze the given text, identify any of the predefined logical fallacies, and return the results as a JSON array. We then send this prompt to the Chat API and parse the response to get the detected fallacies.

The real implementation includes additional features like retry on failure, more detailed prompts, and error handling.

## Webhook Server

The webhook server is implemented using FastAPI. Here's the core webhook handling route:

```python
@app.post("/webhook")
async def twitter_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("x-twitter-webhooks-signature")
    
    if not verify_signature(body, signature):
        return JSONResponse(status_code=403, content={"error": "Invalid signature"})
    
    data = json.loads(body)
    
    if "tweet_create_events" in data:
        for tweet in data["tweet_create_events"]:
            if tweet["user"]["id_str"] != twitter_client.api.verify_credentials().id_str:
                fallacies = fallacy_detector.detect_fallacies(tweet["text"]) 
                if fallacies:
                    response = fallacy_detector.generate_response(fallacies, tweet["text"])
                    if response:
                        twitter_client.reply_to_tweet(tweet["id"], response)
    
    return Response(status_code=200) 
```

The `/webhook` route listens for `POST` requests from Twitter. It first verifies the signature to ensure the request is authentic. It then extracts the tweet text, sends it for fallacy detection, generates a response, and posts it as a reply to the original tweet.

## Streamlit Dashboard

The Streamlit dashboard provides an interactive interface to monitor and test the bot. Here's a snippet of the fallacy testing feature:

```python
def show_sandbox():
    st.header("Test Fallacy Detection")
    
    test_tweet = st.text_area("Enter a tweet to analyze:")
    
    if st.button("Analyze"):
        if test_tweet:
            fallacies = fallacy_detector.detect_fallacies(test_tweet)
            st.subheader("Detected Fallacies")
            for fallacy in fallacies:
                st.write(f"- {fallacy['type']}: {fallacy['explanation']}")
            
            response = fallacy_detector.generate_response(fallacies, test_tweet)
            if response:
                st.subheader("Bot's Response")
                st.info(response)
```

This code renders a text area for the user to enter a tweet, an "Analyze" button to trigger fallacy detection, and displays the detected fallacies and generated bot response.

The dashboard also includes pages for viewing recent bot activity and analytics.

# Challenges and Solutions

1. **Twitter API Integration**: Integrating with the Twitter API, particularly handling webhooks, was tricky. The solution was to use the Tweepy library, which simplifies authentication and API interactions, and carefully following the Twitter webhook setup guide.

2. **GPT-3 Prompt Engineering**: Crafting effective prompts for GPT-3 to detect fallacies accurately and generate relevant responses required extensive experimentation and iteration. The key was to provide clear instructions, examples, and constraints in the prompts.

3. **Error Handling and Reliability**: As the system relies on external APIs, network issues and API errors needed to be handled gracefully. Implementing retry logic with exponential backoff and circuit breakers using the Tenacity library significantly improved reliability.

4. **Deployment and Scalability**: Initially, running all components on a single server limited scalability. The solution was to decouple the components into separate services, containerize them using Docker, and deploy them on a managed platform like AWS ECS or Kubernetes for better scalability and maintainability.

# Future Improvements

1. **Enhanced Fallacy Detection**: Integrate more advanced NLP techniques like sentiment analysis, named entity recognition, and semantic role labeling to improve fallacy detection accuracy.

2. **Personalized Responses**: Use user data and interaction history to tailor bot responses for a more engaging user experience.

3. **Multilingual Support**: Extend the system to detect fallacies and generate responses in multiple languages to cater to a global audience.

4. **Gamification and Learning**: Introduce quizzes, challenges, and rewards in the dashboard to educate users about logical fallacies in an interactive and fun way.

5. **Bias and Fairness**: Regularly audit the system for potential biases and implement techniques like adversarial debiasing to ensure fairness.

# Conclusion

RhetoricalRef demonstrates how AI can be leveraged to promote critical thinking and combat misinformation on social media. The combination of multiple language models and web automation creates a system that can effectively identify and explain logical fallacies in real-time.

While the current implementation focuses on basic fallacy detection and explanation, the architecture supports expansion into more sophisticated analysis techniques and educational features. The modular design allows for easy integration of new models and capabilities as the project grows.
