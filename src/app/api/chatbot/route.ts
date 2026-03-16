import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are Kwasi, a friendly and knowledgeable AI health assistant for OneHealthGH (formerly Apomuden), Ghana's National Digital Health Platform. Your role is to:

1. Help users find healthcare facilities (hospitals, clinics, pharmacies) in Ghana
2. Explain how to use the Apomuden platform features
3. Provide general health information and guidance
4. Assist with emergency service requests
5. Explain NHIS (National Health Insurance Scheme) coverage
6. Guide users on booking appointments

Important guidelines:
- Always be empathetic, professional, and helpful
- For medical emergencies, always advise calling 112 or 193 immediately
- Never provide specific medical diagnoses - recommend consulting healthcare professionals
- Be knowledgeable about Ghana's healthcare system and regions
- Keep responses concise but informative
- Use simple language that's easy to understand
- If asked about specific facilities, suggest using the "Find Facilities" feature

Platform features you can help with:
- Finding nearby hospitals, clinics, pharmacies
- Comparing service prices across facilities
- Checking NHIS coverage
- Requesting emergency services (ambulance)
- Reading health news and alerts
- Registering healthcare facilities
- Leaving reviews for facilities

Remember: You are NOT a replacement for professional medical advice. Always encourage users to consult healthcare professionals for medical concerns.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Simple response generation without external API
function generateResponse(message: string, history: Message[]): string {
  const lowerMessage = message.toLowerCase();

  // Emergency responses
  if (lowerMessage.includes("emergency") || lowerMessage.includes("ambulance") || lowerMessage.includes("urgent")) {
    return `🚨 **For emergencies, please call immediately:**
- **112** - National Emergency Number
- **193** - Ambulance Services

You can also use our Emergency Request feature:
1. Click the "Emergency" button in the header
2. Or go to /emergency on our platform
3. Select your emergency type
4. Your location will be detected automatically
5. Emergency services will be dispatched to you

Is there anything else I can help you with while you wait for emergency services?`;
  }

  // Finding hospitals/facilities
  if (lowerMessage.includes("hospital") || lowerMessage.includes("clinic") || lowerMessage.includes("facility") || lowerMessage.includes("near me") || lowerMessage.includes("find")) {
    return `I can help you find healthcare facilities! Here's how:

**Using Apomuden to find facilities:**
1. Go to the "Find Facilities" page (/facilities)
2. Use the search bar to search by name or location
3. Filter by:
   - Facility type (Hospital, Clinic, Pharmacy, etc.)
   - Region
   - NHIS acceptance
   - Emergency services availability

**On the homepage**, you'll also see:
- "Healthcare Near You" - facilities closest to your location
- "Featured Hospitals" - top-rated facilities in Ghana

Would you like me to explain any specific feature, or do you have a particular region in mind?`;
  }

  // NHIS questions
  if (lowerMessage.includes("nhis") || lowerMessage.includes("insurance") || lowerMessage.includes("coverage")) {
    return `**NHIS (National Health Insurance Scheme)** is Ghana's health insurance program that provides financial access to healthcare.

**Key points about NHIS:**
- Covers outpatient and inpatient services
- Includes maternity care and emergencies
- Available at NHIS-accredited facilities

**On Apomuden:**
- Look for the green "NHIS" badge on facility cards
- Filter facilities by "NHIS Accepted" to find covered providers
- Check individual facility pages for specific covered services

**To register for NHIS:**
Visit your nearest NHIS office or district mutual health insurance scheme office.

Do you have specific questions about NHIS coverage?`;
  }

  // Appointment booking
  if (lowerMessage.includes("appointment") || lowerMessage.includes("book") || lowerMessage.includes("schedule")) {
    return `**Booking appointments through Apomuden:**

Currently, you can:
1. Find a facility using our search
2. View their contact information (phone, email)
3. Call or email directly to book

**Coming soon:** Online appointment booking directly through Apomuden!

**Tips for booking:**
- Check the facility's operating hours on their profile
- Have your NHIS card ready if applicable
- Note down any symptoms or concerns to discuss

Would you like help finding a specific type of facility to book with?`;
  }

  // Health news
  if (lowerMessage.includes("news") || lowerMessage.includes("alert") || lowerMessage.includes("outbreak")) {
    return `**Stay informed with Apomuden Health News:**

On our homepage, you'll find:
- Latest health news from Ghana Health Service
- Disease outbreak alerts
- Vaccination campaigns
- Health advisories for your region

**Enable notifications** by clicking the bell icon 🔔 in the header to receive:
- Disease outbreak alerts in your area
- Important health advisories
- Local health news updates

Is there a specific health topic you'd like information about?`;
  }

  // Facility registration
  if (lowerMessage.includes("register") && (lowerMessage.includes("facility") || lowerMessage.includes("hospital") || lowerMessage.includes("clinic"))) {
    return `**Registering your healthcare facility on Apomuden:**

1. Go to /register-facility
2. Complete the 4-step registration form:
   - Basic Info (name, type, license number)
   - Location & Contact details
   - Services & Capabilities
   - Administrator information

**Requirements:**
- Valid Ghana Health Service license number
- Facility contact information
- Administrator details for account management

After submission, the Ministry of Health will verify your facility within 5-7 business days.

Would you like more details about any step?`;
  }

  // Greetings
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey") || lowerMessage.includes("good")) {
    return `Hello! 👋 I'm Kwasi, your AI health assistant on Apomuden.

I can help you with:
- 🏥 Finding hospitals, clinics, and pharmacies
- 🚑 Emergency service requests
- 💳 NHIS coverage information
- 📰 Health news and alerts
- 📅 Booking guidance

What would you like help with today?`;
  }

  // Thank you
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return `You're welcome! 😊 I'm always here to help.

Is there anything else you'd like to know about:
- Finding healthcare facilities
- Emergency services
- NHIS coverage
- Or any other health-related questions?

Stay healthy! 🌟`;
  }

  // Default response
  return `I understand you're asking about "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}".

Here's how I can help you on Apomuden:

🏥 **Find Facilities** - Search for hospitals, clinics, pharmacies near you
🚑 **Emergency Services** - Request ambulance or report emergencies
💳 **NHIS Information** - Learn about insurance coverage
📰 **Health News** - Stay updated on health alerts
📝 **Register Facility** - Add your healthcare facility to our platform

Could you please be more specific about what you need? For example:
- "Find hospitals in Accra"
- "How do I request an ambulance?"
- "What does NHIS cover?"

I'm here to help! 🌟`;
}

// Language-specific response wrappers
const LANGUAGE_RESPONSES: Record<string, Record<string, string>> = {
  tw: {
    emergency: `🚨 **Wɔ ntɛm mmoa ho a, frɛ ntɛm:**
- **112** - Ghana Ntɛm Nɔma
- **193** - Ambulance Adwuma

Wo betumi de yɛn Emergency Request feature adi dwuma:
1. Klik "Emergency" button wɔ header no mu
2. Anaasɛ kɔ /emergency wɔ yɛn platform so
3. Yi wo emergency type
4. Yɛbɛhu wo beae no ankasa
5. Emergency services bɛba wo nkyɛn

Biribi foforo wɔ hɔ a metumi aboa wo?`,
    greeting: `Akwaaba! 👋 Me din de Kwasi, wo AI apɔmuden boafo wɔ Apomuden so.

Metumi aboa wo wɔ:
- 🏥 Ayaresabea, clinic, ne pharmacy ho hwehwɛ
- 🚑 Ntɛm mmoa abisade
- 💳 NHIS ho nsɛm
- 📰 Apɔmuden nsɛm ne kɔkɔbɔ
- 📅 Bere hyɛ nkyerɛkyerɛmu

Dɛn na wopɛ sɛ meboa wo wɔ ɛnnɛ?`,
  },
  ga: {
    emergency: `🚨 **Gbɛkɛ bɔ ni, yɛlɛ ntɛm:**
- **112** - Ghana Gbɛkɛ Nɔmba
- **193** - Ambulance

Tɛŋ yɛ Emergency Request feature:
1. Klik "Emergency" button
2. Kɛ kɔ /emergency
3. Yi bo gbɛkɛ type
4. Miihu bo teŋ
5. Gbɛkɛ bɔ baa

Mɛni fofo lɛ miitɛŋ bɔ bo?`,
    greeting: `Ojekoo! 👋 Mi ŋmɛi lɛ Kwasi, bo AI duŋ botsɛ wɔ Apomuden ji.

Miitɛŋ bɔ bo wɔ:
- 🏥 Duŋ shishi fɛɛ
- 🚑 Gbɛkɛ bɔ
- 💳 NHIS shi
- 📰 Duŋ tsɔtsɔ
- 📅 Bere hyɛ

Mɛni lɛ bopɛ miibɔ bo enyɔ?`,
  },
  ee: {
    emergency: `🚨 **Kpekpe me, yɔ enumake:**
- **112** - Ghana Kpekpe Xexlẽdzesi
- **193** - Ambulance

Zã míaƒe Emergency Request feature:
1. Klik "Emergency" button
2. Alo yi ɖe /emergency
3. Tia wò kpekpe ƒomevi
4. Míakpɔ wò nɔƒe
5. Kpekpe kpɔɖeŋu ava

Nuka bubu mate ŋu akpe ɖe ŋuwò?`,
    greeting: `Woezɔ! 👋 Ŋkɔnye nye Kwasi, wò AI lãmesẽ kpɔɖeŋutɔ le Apomuden dzi.

Mate ŋu akpe ɖe ŋuwò le:
- 🏥 Atikewɔƒewo didi
- 🚑 Kpekpe kpɔɖeŋu biabia
- 💳 NHIS nyawo
- 📰 Lãmesẽ nyatsɔtsɔwo
- 📅 Ŋkeke ŋlɔŋlɔ alɔdzeɖeŋu

Aleke nàdi be makpe ɖe ŋuwò egbe?`,
  },
  ha: {
    emergency: `🚨 **Don gaggawa, kira nan take:**
- **112** - Lambar Gaggawa ta Ghana
- **193** - Sabis na Motar Asibiti

Za fasalin Neman Gaggawa:
1. Danna maɓallin "Emergency"
2. Ko je /emergency
3. Zaɓi nau'in gaggawar ka
4. Za mu gano wurin ka
5. Za a aiko maka da taimako

Akwai wani abu da zan taimaka?`,
    greeting: `Sannu! 👋 Sunana Kwasi, mataimakin lafiya na AI a Apomuden.

Zan iya taimaka maka da:
- 🏥 Nemo asibitoci, kilinik, da kantin magani
- 🚑 Neman sabis na gaggawa
- 💳 Bayani game da NHIS
- 📰 Labaran lafiya da faɗakarwa
- 📅 Jagorar yin alƙawari

Me kake so in taimaka maka yau?`,
  },
};

function getLocalizedResponse(response: string, language: string): string {
  // For non-English languages, try to provide localized responses
  if (language !== "en" && LANGUAGE_RESPONSES[language]) {
    // Check for emergency response
    if (response.includes("112") || response.includes("emergency")) {
      return LANGUAGE_RESPONSES[language].emergency || response;
    }
    // Check for greeting
    if (response.includes("Hello!") || response.includes("👋")) {
      return LANGUAGE_RESPONSES[language].greeting || response;
    }
  }
  return response;
}

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Language-specific system prompts
const LANGUAGE_PROMPTS: Record<string, string> = {
  en: "Respond in English.",
  tw: "Respond in Twi (Akan language of Ghana). Use appropriate Twi greetings and expressions.",
  ga: "Respond in Ga (language of the Ga people of Ghana). Use appropriate Ga greetings and expressions.",
  ee: "Respond in Ewe (language of the Ewe people of Ghana and Togo). Use appropriate Ewe greetings and expressions.",
  ha: "Respond in Hausa (widely spoken in Northern Ghana). Use appropriate Hausa greetings and expressions.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, language = "en" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // If Anthropic API key is available, use Claude AI
    if (anthropic) {
      try {
        const languageInstruction = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;
        
        // Build conversation history for Claude
        const messages: { role: "user" | "assistant"; content: string }[] = [];
        
        // Add previous conversation history
        if (history && Array.isArray(history)) {
          history.slice(-6).forEach((msg: Message) => {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          });
        }
        
        // Add current message
        messages.push({ role: "user", content: message });

        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: `${SYSTEM_PROMPT}\n\n${languageInstruction}`,
          messages: messages,
        });

        const aiResponse = response.content[0].type === "text" 
          ? response.content[0].text 
          : "I apologize, but I couldn't generate a response.";

        return NextResponse.json({
          success: true,
          response: aiResponse,
        });
      } catch (aiError) {
        console.error("Claude AI error:", aiError);
        // Fall back to rule-based response
      }
    }

    // Fallback: Generate response using rule-based system
    let response = generateResponse(message, history || []);
    
    // Apply language localization
    response = getLocalizedResponse(response, language);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
