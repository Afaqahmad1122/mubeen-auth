import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Registration API",
      version: "1.0.0",
      description:
        "API documentation for user registration system with 23 fields",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: [
            "gender",
            "interestedIn",
            "dob",
            "hometown",
            "height",
            "religion",
            "language",
            "ethnicity",
            "education",
            "fullName",
            "email",
            "drinking",
            "smoking",
            "iceBreakers1",
            "iceBreakers2",
            "iceBreakers3",
            "images",
          ],
          properties: {
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "male",
              description: "User's gender",
            },
            interestedIn: {
              type: "string",
              enum: ["male", "female", "both"],
              example: "female",
              description: "Interested in",
            },
            dob: {
              type: "string",
              format: "date",
              example: "1995-05-15",
              description: "Date of birth (must be 18+)",
            },
            hometown: {
              type: "string",
              example: "Lahore",
              description: "Hometown",
            },
            height: {
              type: "number",
              example: 175,
              description: "Height in cm",
            },
            religion: {
              type: "string",
              example: "Islam",
              description: "Religion",
            },
            language: {
              type: "string",
              example: "Urdu",
              description: "Language",
            },
            ethnicity: {
              type: "string",
              example: "Pakistani",
              description: "Ethnicity",
            },
            schoolName: {
              type: "string",
              example: "ABC High School",
              description: "School name (optional)",
            },
            education: {
              type: "string",
              example: "Bachelor's Degree",
              description: "Education level",
            },
            jobTitle: {
              type: "string",
              example: "Software Engineer",
              description: "Job title (optional)",
            },
            companyName: {
              type: "string",
              example: "Tech Corp",
              description: "Company name (optional)",
            },
            fullName: {
              type: "string",
              example: "John Doe",
              description: "Full name",
            },
            socialHandle: {
              type: "string",
              example: "@johndoe",
              description: "Social media handle (optional)",
            },
            socialHandlePlatform: {
              type: "string",
              enum: ["instagram", "twitter", "facebook", "tiktok", "snapchat"],
              example: "instagram",
              description: "Social media platform (optional)",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
              description: "Email address",
            },
            drinking: {
              type: "string",
              enum: ["never", "socially", "regularly"],
              example: "never",
              description: "Drinking preference",
            },
            smoking: {
              type: "string",
              enum: ["never", "occasionally", "regularly"],
              example: "never",
              description: "Smoking preference",
            },
            iceBreakers1: {
              type: "string",
              example: "I love coding and building apps",
              description: "First ice breaker",
            },
            iceBreakers2: {
              type: "string",
              example: "Coffee enthusiast and travel lover",
              description: "Second ice breaker",
            },
            iceBreakers3: {
              type: "string",
              example: "Always up for a good conversation",
              description: "Third ice breaker",
            },
            politicalAffiliation: {
              type: "string",
              enum: [
                "liberal",
                "conservative",
                "moderate",
                "independent",
                "other",
              ],
              example: "moderate",
              description: "Political affiliation (optional)",
            },
            images: {
              type: "array",
              minItems: 4,
              maxItems: 6,
              items: {
                type: "string",
                format: "uri",
              },
              example: [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg",
                "https://example.com/image3.jpg",
                "https://example.com/image4.jpg",
              ],
              description: "User images (4-6 required)",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "User registered successfully",
            },
            data: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Valid gender is required, Valid email is required",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
