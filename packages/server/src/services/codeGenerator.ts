interface GenerationParams {
    prompt: string;
    language?: string;
    framework?: string;
}

/**
 * Generates a YouTube downloader code snippet.
 * @returns {string} The generated code.
 */
export function generateYouTubeDownloader(): string {
  return `// YouTube Video Downloader
// Note: This is a client-side implementation that requires a backend proxy for API calls and downloads.

class YouTubeDownloader {
    // The API key should be handled by a backend proxy, not exposed on the client.
    // This class would call your own server's endpoints, e.g., /api/youtube/info
    
    async getVideoInfo(videoUrl: string): Promise<any> {
        try {
            const videoId = this.extractVideoId(videoUrl);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            // In a real app, this fetch would be to your own backend proxy endpoint.
            // e.g., const response = await fetch(\`/api/youtube/info?videoId=\${videoId}\`);
            // The backend would then make the call to the YouTube API with the secret key.
            const response = await fetch(\`https://www.googleapis.com/youtube/v3/videos?id=\${videoId}&key=YOUR_YOUTUBE_API_KEY&part=snippet,contentDetails\`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return {
                    title: data.items[0].snippet.title,
                    description: data.items[0].snippet.description,
                    duration: data.items[0].contentDetails.duration,
                    thumbnail: data.items[0].snippet.thumbnails.high.url
                };
            }
            throw new Error('Video not found');
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }

    extractVideoId(url: string): string | null {
        const regex = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async downloadVideo(videoUrl: string, quality: string = '720p'): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const videoInfo = await this.getVideoInfo(videoUrl);
            
            // This should point to your server's download endpoint.
            const downloadUrl = \`/api/download-video?url=\${encodeURIComponent(videoUrl)}&quality=\${quality}\`;
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = \`\${videoInfo.title}.mp4\`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return { success: true, message: 'Download started' };
        } catch (error: any) {
            console.error('Download error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Usage example
const downloader = new YouTubeDownloader();
export { YouTubeDownloader };`;
}

/**
 * Generates a generic function snippet based on a prompt.
 * @param {GenerationParams} params - The generation parameters.
 * @returns {string} The generated code.
 */
export function generateGenericFunction({ prompt, language = 'javascript', framework = 'none' }: GenerationParams): string {
    const functionName = prompt.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 25) || 'generatedFunction';
  return "// Generated " + language + " code for: " + prompt + "\n" +
  "// Framework: " + framework + "\n" +
  "\n" +
  "function " + functionName + "() {\n" +
  "    // Implementation for: " + prompt + "\n" +
  "    console.log('Executing: " + prompt + "');\n" +
  "    return { status: 'success', message: 'Function executed successfully' };\n" +
  " }\n" +
  "\n" +
  "export default " + functionName + ";";
}

 export function generateCodeFromPrompt(params: GenerationParams): string {
    const { prompt } = params;
    if (prompt.toLowerCase().includes('youtube') && prompt.toLowerCase().includes('download')) {
        return generateYouTubeDownloader();
    } else {
        return generateGenericFunction(params);
    }
}