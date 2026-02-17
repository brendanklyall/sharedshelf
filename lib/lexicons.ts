// Lexicon schema definitions — used in the Protocol tab view

export const LEXICON_SCHEMAS = {
  collection: {
    lexicon: 1,
    id: "social.sharedshelf.collection",
    description: "A curated collection of items — books, places, links, recommendations",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          required: ["name", "createdAt"],
          properties: {
            name: { type: "string", maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            icon: { type: "string", maxLength: 4 },
            visibility: {
              type: "string",
              knownValues: ["public", "mutuals", "private"],
              default: "public",
            },
            collaborators: {
              type: "array",
              items: { type: "string", format: "did" },
            },
            createdAt: { type: "string", format: "datetime" },
          },
        },
      },
    },
  },
  item: {
    lexicon: 1,
    id: "social.sharedshelf.item",
    description: "An item within a collection — can reference any AT URI in the Atmosphere",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          required: ["collection", "title", "createdAt"],
          properties: {
            collection: {
              type: "string",
              format: "at-uri",
              description: "AT URI of the parent collection",
            },
            title: { type: "string", maxLength: 200 },
            note: { type: "string", maxLength: 2000 },
            url: { type: "string", format: "uri" },
            ref: {
              type: "string",
              format: "at-uri",
              description: "AT URI referencing content from any Atmosphere app",
            },
            tags: {
              type: "array",
              items: { type: "string", maxLength: 50 },
              maxLength: 10,
            },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            createdAt: { type: "string", format: "datetime" },
          },
        },
      },
    },
  },
};

export const ATMOSPHERE_APPS = [
  {
    name: "Bluesky",
    icon: "🦋",
    lexicon: "app.bsky.feed.post",
    desc: "Save posts, threads, and quotes",
    url: "https://bsky.app",
  },
  {
    name: "WhiteWind",
    icon: "📝",
    lexicon: "com.whtwnd.blog.entry",
    desc: "Save blog posts and essays",
    url: "https://whtwnd.com",
  },
  {
    name: "Frontpage",
    icon: "📰",
    lexicon: "fyi.unravel.frontpage.post",
    desc: "Save and organize links",
    url: "https://frontpage.fyi",
  },
  {
    name: "Smoke Signal",
    icon: "🎪",
    lexicon: "events.smokesignal.rsvp",
    desc: "Save events and meetups",
    url: "https://smokesignal.events",
  },
  {
    name: "Recipe Exchange",
    icon: "🍳",
    lexicon: "exchange.recipe.recipe",
    desc: "Save recipes to try",
    url: "https://recipe.exchange",
  },
  {
    name: "Skylights",
    icon: "📖",
    lexicon: "my.skylights.book",
    desc: "Save book reviews and reading lists",
    url: "https://skylights.my",
  },
];
