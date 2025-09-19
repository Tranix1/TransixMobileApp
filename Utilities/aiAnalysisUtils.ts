import { ImagePickerAsset } from 'expo-image-picker';
import { model } from '@/db/fireBaseConfig';
import { createAIPrompt, mapAIResponse } from './loadUtils';

export interface AIAnalysisResult {
    cargoArea: any;
    truckType: { id: number, name: string };
    capacity: { id: number, name: string };
    tankerType: { id: number, name: string } | null;
    reasoning: string;
}

export const analyzeLoadImages = async (
    loadImages: ImagePickerAsset[],
    setAiLoading: (loading: boolean) => void,
    setAiAnalysisError: (error: string | null) => void,
    setAiAnalysisComplete: (complete: boolean) => void,
    setAiDetectedCargoArea: (cargoArea: any) => void,
    setAiDetectedTruckType: (truckType: { id: number, name: string } | null) => void,
    setAiDetectedCapacity: (capacity: { id: number, name: string } | null) => void,
    setAiDetectedTankerType: (tankerType: { id: number, name: string } | null) => void,
    setAiAnswer: (answer: string) => void
): Promise<void> => {
    if (loadImages.length === 0) {
        setAiAnalysisError("Please add images of your load first");
        return;
    }

    try {
        setAiLoading(true);
        setAiAnalysisError(null);

        // Convert images to base64 for AI analysis
        const imagePromises = loadImages.map(async (image) => {
            const response = await fetch(image.uri);
            const blob = await response.blob();
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        });

        const base64Images = await Promise.all(imagePromises);

        // Create AI prompt for truck type detection
        const prompt = createAIPrompt();

        const result: any = await (model as any).generateContent([
            { text: prompt },
            ...base64Images.map(img => ({ inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] } }))
        ]);

        const responseText = typeof result?.response?.text === 'function'
            ? result.response.text()
            : (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "");

        // Parse AI response with error handling
        let aiResponse;
        try {
            // Clean the response text to extract JSON
            const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
            aiResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);
            console.log('Raw AI response:', responseText);

            // Try to extract JSON from the response using regex
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiResponse = JSON.parse(jsonMatch[0]);
                } catch (regexParseError) {
                    throw new Error('AI response is not in valid JSON format. Please try again with clearer images.');
                }
            } else {
                throw new Error('AI response does not contain valid JSON. Please try again with clearer images.');
            }
        }

        // Validate AI response structure
        if (!aiResponse.cargoArea || !aiResponse.truckType || !aiResponse.capacity) {
            throw new Error('AI response is missing required fields. Please try again.');
        }

        // Map AI recommendations to app data structures
        const mappedResults = mapAIResponse(aiResponse);

        setAiDetectedCargoArea(mappedResults.cargoArea);
        setAiDetectedTruckType(mappedResults.truckType);
        setAiDetectedCapacity(mappedResults.capacity);
        setAiDetectedTankerType(mappedResults.tankerType);

        setAiAnalysisComplete(true);

        // Store AI reasoning for display
        setAiAnswer(aiResponse.reasoning || 'AI analysis completed successfully.');

        // Log successful analysis for debugging
        console.log('AI Analysis Results:', {
            cargoArea: mappedResults.cargoArea.name,
            truckType: mappedResults.truckType.name,
            capacity: mappedResults.capacity.name,
            tankerType: aiResponse.tankerType,
            reasoning: aiResponse.reasoning
        });

    } catch (error: any) {
        console.error('AI analysis error:', error);
        setAiAnalysisError(error.message || 'Failed to analyze images');
    } finally {
        setAiLoading(false);
    }
};

export const askVertexAI = async (
    question: string,
    setAiLoading: (loading: boolean) => void,
    setAiAnswer: (answer: string) => void
): Promise<void> => {
    if (!question.trim()) return;

    try {
        setAiLoading(true);
        setAiAnswer("");
        console.log('[VertexAI] Sending prompt:', question);
        const result: any = await (model as any).generateContent(question);
        console.log('[VertexAI] Raw response:', result);
        const text = typeof result?.response?.text === 'function'
            ? result.response.text()
            : (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "");
        setAiAnswer(text || "(no response)");
    } catch (e: any) {
        console.error('[VertexAI] Error while generating content:', e);
        setAiAnswer(e?.message || 'Failed to get response');
    } finally {
        setAiLoading(false);
    }
};
