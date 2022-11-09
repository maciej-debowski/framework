const mix = require("laravel-mix")

mix.ts("tests/src/index.ts", "tests/public/dist/index.dist.js")
