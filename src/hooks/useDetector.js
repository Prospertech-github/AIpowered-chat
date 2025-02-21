import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";

const useDetector = () => {
  const [aidetectedLanguage, setAiDetectedLanguage] = useState(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    async function checkLanguageDetectorAI() {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;

      if (canDetect === "no") {
        toast.error("Language Detection AI not enabled on this environment");
        return;
      }

      if (canDetect === "readily") {
        detectorRef.current = await self.ai.languageDetector.create();
      } else {
        detectorRef.current = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        await detectorRef.current.ready;
      }
    }
    checkLanguageDetectorAI();
  }, []);

    const detectMessageLanguage = async (text) => {
      if (!detectorRef.current || !text) return;

      try {
        const results = await detectorRef.current.detect(text);
        const highestConfidence = results.reduce(
          (max, result) => (result.confidence > max.confidence ? result : max),
          results[0]
        );

        const { detectedLanguage, confidence } = highestConfidence;
        setAiDetectedLanguage({
          detectedLanguage,
          languageValue: languageTagToHumanReadable(detectedLanguage),
          confidence: (confidence * 100).toFixed(1),
        });
      } catch (error) {
        console.error(`Detection error: ${error}`);
      }
    }

  const languageTagToHumanReadable = (languageTag, targetLanguage = "en") => {
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: "language",
    });
    return displayNames.of(languageTag);
  };

  return {aidetectedLanguage, detectMessageLanguage, languageTagToHumanReadable}
};

export default useDetector;
