/**
 * Netlify Function to keep Supabase connection alive
 * This function should be called daily by an external cron service
 * to prevent Supabase from sleeping when the app is inactive
 */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl =
      process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Server configuration error",
          message: "Supabase credentials not configured",
        }),
      };
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("documents")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive ping failed:", error.message);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "Ping completed but encountered an error",
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    console.log("Keep-alive ping successful");
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Supabase connection kept alive",
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Keep-alive function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
