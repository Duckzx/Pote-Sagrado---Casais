const fs = require('fs');

const transcriptPath = '/.gemini/antigravity/brain/8f6943a1-117e-4411-b48b-2e89efb1e3a7/.system_generated/logs/transcript.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.log('Transcript not found');
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
const componentContents = {};

for (const line of lines) {
  try {
    const data = JSON.parse(line);
    // Looking for AI assistant tool calls
    if (data.type === 'tool_calls' || data.type === 'call') {
      let calls = data.tool_calls || [data];
      for (const call of calls) {
        if (call.name === 'default_api:create_file' || call.name === 'default_api:edit_file' || call.name === 'default_api:multi_edit_file') {
          const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
          if (args && args.TargetFile && args.TargetFile.startsWith('/src/components/')) {
             if (call.name === 'default_api:create_file') {
                componentContents[args.TargetFile] = args.Content;
             } else if (call.name === 'default_api:edit_file') {
                // If it was edited, we might have to apply the edit or just see if the result is better.
                // Actually if it was edited using edit_file, we'd need to apply the replacement.
                if(componentContents[args.TargetFile] && args.TargetContent && args.ReplacementContent) {
                  componentContents[args.TargetFile] = componentContents[args.TargetFile].replace(args.TargetContent, args.ReplacementContent);
                }
             } else if (call.name === 'default_api:multi_edit_file') {
                if(componentContents[args.TargetFile] && args.ReplacementChunks) {
                    for(const chunk of args.ReplacementChunks) {
                        componentContents[args.TargetFile] = componentContents[args.TargetFile].replace(chunk.TargetContent, chunk.ReplacementContent);
                    }
                }
             }
          }
        }
      }
    }
    
    // Also check responses just in case
    if (data.tool_call_id && typeof data.response === 'string') {
        // Not much we can do here unless it's a view_file response
    }
  } catch(e) {
    // console.error(e);
  }
}

for (const [file, content] of Object.entries(componentContents)) {
  if (content && content.trim().length > 0) {
    // Only restore if the file exists and has fewer lines or something?
    // Actually, let's just restore them all because my \s+ replace ruined everything
    fs.writeFileSync(file, content);
    console.log(`Restored ${file}`);
  }
}
console.log('Restoration complete.');
