interface CodeGenerationRequest {
    prompt: string;
    language?: string;
    framework?: string;
    projectType?: string;
}
interface CodeGenerationResponse {
    code: string;
    language: string;
    framework: string;
    explanation?: string;
}
declare class AIService {
    private gemini;
    private openai;
    private anthropic;
    constructor();
    generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
    private generateWithGemini;
    private generateWithOpenAI;
    private generateWithAnthropic;
    private generateFallbackCode;
    private cleanCode;
}
declare const _default: AIService;
export default _default;
//# sourceMappingURL=aiService.d.ts.map