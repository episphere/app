(async ()=>{})(
    jonasCalculator = (await import('http://localhost:8000/app/jonas/calculator/export.js')).calculator 
)