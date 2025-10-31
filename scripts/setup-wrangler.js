import fs from 'fs';
import path from 'path';

/**
 * Parse wrangler.jsonc.copy, read DB_NAME and DB_ID from environment variables,
 * and generate wrangler.jsonc with updated d1_databases configuration
 */
function generateWranglerConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'wrangler.jsonc.copy');
    let content = fs.readFileSync(configPath, 'utf-8');
    // Remove trailing commas before closing brackets/braces for valid JSON
    content = content.replace(/,\s*\n\s*]/g, '\n]');
    content = content.replace(/,\s*\n\s*}/g, '\n}');
    const config = JSON.parse(content);
    const workerName = process.env.WORKER_NAME;

    if (workerName === undefined) {
      throw new Error('Environment variable WORKER_NAME is not set');
    }

    config.name = workerName;
    const outputPath = path.resolve(process.cwd(), 'wrangler.jsonc');
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2) + '\n');

    console.log('✓ wrangler.jsonc created successfully');
    console.log(`  Worker Name: ${workerName}`);
  } catch (error) {
    console.error('Error generating wrangler config:', error);
    process.exit(1);
  }
}

// Execute the function
generateWranglerConfig();
