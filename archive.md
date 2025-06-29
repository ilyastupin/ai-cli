-e 

---
### .vscode/extensions.json
---

{
  "recommendations": [
    "streetsidesoftware.code-spell-checker",
    "bierner.comment-tagged-templates",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "yoavbls.pretty-ts-errors",
    "dpkshrma.insert-iso-timestamp"
  ]
}
-e 

---
### .vscode/launch.json
---

{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Customer Web",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/customer-web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"]
    },
    {
      "name": "Launch CI-CD Customer Web",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/customer-web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["serve-cicd"]
    },
    {
      "name": "Launch Customer Web with server.js",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/backend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["start-customer-web"]
    },
    {
      "name": "Launch Outfitter Web",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/outfitter-web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"]
    },
    {
      "name": "Launch CI-CD Outfitter Web",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/outfitter-web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["serve-cicd"]
    },
    {
      "name": "Launch Rocket Web",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/rocket-web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Test Services File",
      "cwd": "${workspaceRoot}/packages/services",
      "runtimeExecutable": "pa-config",
      "runtimeArgs": ["-a=services", "-v=none", "-o=.env.js", "node", "-r", "ts-node/register"],
      "program": "${file}",
      "console": "integratedTerminal",
      "//1": "Only needed at top of tree",
      "outFiles": ["${workspaceFolder}/**/*.js", "!**/node_modules/**", "${workspaceFolder}/packages/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Test Rest Backend File",
      "cwd": "${workspaceFolder}/backend",
      "runtimeExecutable": "pa-config",
      "runtimeArgs": ["-a=backend", "-v=none", "-o=.env.js", "node", "-r", "./preload-sentry", "-r", "ts-node/register"],
      "program": "${file}",
      "console": "integratedTerminal",
      "outFiles": ["${workspaceFolder}/**/*.js", "!**/node_modules/**", "${workspaceFolder}/packages/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Server",
      "outputCapture": "std",
      "cwd": "${workspaceFolder}/backend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["start-debug"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Queue processor",
      "outputCapture": "std",
      "cwd": "${workspaceFolder}/queue-processor",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["start-debug"],
      "outFiles": ["${workspaceFolder}/**/*.js", "!**/node_modules/**", "${workspaceFolder}/packages/**/*.js"],
      "stopOnEntry": false
    }
  ]
}
-e 

---
### .vscode/settings.json
---

{
  "cSpell.words": [
    "ADMINWEB",
    "adventurecheck",
    "Alteryx",
    "Anoka",
    "APIM",
    "ARRAYAGG",
    "arrivalhq",
    "autoqual",
    "beartest",
    "BODID",
    "Bruss",
    "Cacheable",
    "cachify",
    "camelcase",
    "campaignmanagement",
    "Chargeback",
    "chargebacks",
    "Checkly",
    "checklyoutfitter",
    "checklysxstestproduct",
    "CICD",
    "Cloudinary",
    "Cloudops",
    "Colestock",
    "cportal",
    "CSID",
    "Csize",
    "datetime",
    "DBDOCS",
    "DBML",
    "DDTHH",
    "deepl",
    "devicenumber",
    "dispositioned",
    "dompurify",
    "donotsendemail",
    "ecommerce",
    "eins",
    "Enroute",
    "exbibyte",
    "Exops",
    "experienceops",
    "falsey",
    "flushall",
    "fontawesome",
    "formik",
    "fortawesome",
    "growsumo",
    "gstest",
    "heroicons",
    "hgetall",
    "hidechatbot",
    "hmget",
    "hmset",
    "ibmi",
    "Ilya's",
    "IMCR",
    "IMEI",
    "ipaddr",
    "JWKS",
    "kibibyte",
    "Klaviyo",
    "languagedetector",
    "Lindeman",
    "Linxup",
    "livemode",
    "mailinator",
    "mapbox",
    "marcatopartners",
    "marketingcoupons",
    "mebibyte",
    "Mgmt",
    "MPWR",
    "Multicomplete",
    "objlen",
    "Offroad",
    "onumber",
    "onwarn",
    "ORDWAY",
    "ostring",
    "outfitterrating",
    "Parens",
    "Partnerstack",
    "POACAMPAIGNS",
    "POARENTALS",
    "poladv",
    "POLARISCLOUDOPS",
    "polarisexops",
    "POLARISOPS",
    "Posthook",
    "Powersports",
    "precache",
    "precached",
    "precaching",
    "Precertified",
    "Prerendered",
    "Prerendering",
    "preride",
    "Priceable",
    "Promocode",
    "querystringify",
    "rainforest",
    "rainforestselectmember",
    "ridersafety",
    "sbva",
    "Sendgrid",
    "setex",
    "sonner",
    "staticmap",
    "Substatus",
    "swiper",
    "tebibyte",
    "tele",
    "Telematics",
    "tesults",
    "Timeslot",
    "Timestream",
    "twiml",
    "TYPEFORM",
    "ULTRALOW",
    "Uncategorized",
    "Unresolve",
    "upsert",
    "urlset",
    "USDL",
    "uuidv",
    "versionid",
    "waybook",
    "WEBEVOLVE",
    "webfonts",
    "WEBWAIVER",
    "Wishlisted",
    "Woot",
    "xauth",
    "XPEDITION",
    "yrisk"
  ],
  "prettier.configPath": ".prettierrc",
  "prettier.requireConfig": true,
  "editor.formatOnSave": true,
  "files.associations": {
    ".env.js": "javascript"
  }
}-e 

---
### .vscode/tasks.json
---

{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "npm",
			"path": "backend",
			"label": "backend - pnpm: start",
			"detail": "start the backend",
			"problemMatcher": [],
			"script": "start"
		},
		{
			"type": "npm",
			"path": "customer-web",
			"label": "customer-web - pnpm: dev",
			"detail": "start the customer-web",
			"problemMatcher": [],
			"script": "dev"
		},
		{
			"type": "npm",
			"path": "packages/services",
			"label": "packages/services - pnpm: migrate",
			"detail": "migrate local database",
			"problemMatcher": [],
			"script": "migrate"
		},
		{
			"type": "npm",
			"path": "outfitter-web",
			"label": "outfitter-web - pnpm: dev",
			"detail": "start the outfitter-web",
			"problemMatcher": [],
			"script": "dev"
		},
	]
}
