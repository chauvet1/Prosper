import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// HTTP endpoint for blog posts (GET /api/blog/posts)
http.route({
  path: "/api/blog/posts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const featured = url.searchParams.get("featured");
    const category = url.searchParams.get("category");

    try {
      let posts;
      
      if (featured === "true") {
        posts = await ctx.runQuery(api.blog.getFeaturedPosts, {
          limit: limit ? parseInt(limit) : undefined
        });
      } else if (category) {
        posts = await ctx.runQuery(api.blog.getPostsByCategory, {
          category,
          limit: limit ? parseInt(limit) : undefined
        });
      } else {
        posts = await ctx.runQuery(api.blog.getPublishedPosts, {
          limit: limit ? parseInt(limit) : undefined,
          featured: featured === "true" ? true : undefined
        });
      }

      return new Response(JSON.stringify({
        success: true,
        posts,
        count: posts.length
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to fetch blog posts",
        posts: [],
        count: 0
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// HTTP endpoint for specific blog post (GET /api/blog/posts/:id)
http.route({
  path: "/api/blog/posts/:id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    try {
      // Try to get by ID first, then by slug
      let post;
      try {
        post = await ctx.runQuery(api.blog.getPostById, { id: id as any });
      } catch {
        // If ID fails, try slug
        post = await ctx.runQuery(api.blog.getPostBySlug, { slug: id });
      }

      if (!post) {
        return new Response(JSON.stringify({
          success: false,
          error: "Blog post not found",
          post: null
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Get images for this post
      const images = await ctx.runQuery(api.blog.getPostImages, { postId: post._id });

      return new Response(JSON.stringify({
        success: true,
        post: {
          ...post,
          images
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to fetch blog post",
        post: null
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// HTTP endpoint for portfolio data (GET /api/portfolio)
http.route({
  path: "/api/portfolio",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const [personalInfo, skills, experiences, projects, education, certificates] = await Promise.all([
        ctx.runQuery(api.portfolio.getPersonalInfo, {}),
        ctx.runQuery(api.portfolio.getSkills, {}),
        ctx.runQuery(api.portfolio.getExperiences, {}),
        ctx.runQuery(api.portfolio.getProjects, {}),
        ctx.runQuery(api.portfolio.getEducation, {}),
        ctx.runQuery(api.portfolio.getCertificates, {})
      ]);

      return new Response(JSON.stringify({
        success: true,
        data: {
          personalInfo,
          skills,
          experiences,
          projects,
          education,
          certificates
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to fetch portfolio data",
        data: null
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// HTTP endpoint for leads (POST /api/leads)
http.route({
  path: "/api/leads",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { name, email, phone, company, message, projectRequirements, source, locale } = body;

      if (!name || !email) {
        return new Response(JSON.stringify({
          success: false,
          error: "Name and email are required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const leadId = await ctx.runMutation(api.leads.createLead, {
        name,
        email,
        phone,
        company,
        message,
        projectRequirements,
        source: source || "website",
        locale: locale || "en"
      });

      return new Response(JSON.stringify({
        success: true,
        leadId,
        message: "Lead created successfully"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create lead"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// HTTP endpoint for AI assistant (POST /api/ai-assistant)
http.route({
  path: "/api/ai-assistant",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { message, context, pageContext, sessionId, conversationHistory, locale } = body;

      if (!message) {
        return new Response(JSON.stringify({
          success: false,
          error: "Message is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const response = await ctx.runAction(api.ai.aiAssistant, {
        message,
        context,
        pageContext,
        sessionId,
        conversationHistory,
        locale: locale || "en"
      });

      return new Response(JSON.stringify({
        success: true,
        response
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error with AI assistant:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "AI assistant error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// CORS preflight handler
http.route({
  path: "/api/*",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

export default http;
