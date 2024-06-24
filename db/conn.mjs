import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

console.log("Connection String:", process.env.ATLAS_URI);
const client = new MongoClient(process.env.ATLAS_URI);

async function connectDB(){
  let conn;
  try {
  conn = await client.connect();
  console.log("MongoDB connected successfully.");
  } catch (e) {
  console.error("Failled to connect to MongoDB:", e);
  process.exit(1);   //Exit if the database connection fails
  } 

  const db = conn.db("sample_training");

  // Set validation rules for the grades collection
  try {
      await db.command({
        collMod: "grades",
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["class_id", "learner_id"],
                properties: {
                    class_id: {
                        bsonType: "int",
                        minimum: 0,
                        maximum: 300
                    },
                    learner_id: {
                        bsonType: "int",
                        minimum: 0
                    }
                }
            }
        },
        validationLevel: "moderate",  // or "strict"
        validationAction: "warn"  // or "error"
    });
    console.log("Validation rules set successfully.");
  } catch (e) {
    console.error("Error setting validation rules:", e);
  } 

  // Create indexes
  try {
    await db.collection("grades").createIndex({ class_id: 1 });
    await db.collection("grades").createIndex({ learner_id: 1 });
    await db.collection("grades").createIndex({ learner_id: 1, class_id: 1 });
    console.log("Indexes created successfully.");
  } catch (e) {
  console.error("Error creating indexes:", e);
  }

  return db;

}

const db = await connectDB();

export default db;