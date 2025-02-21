import { useState } from "react";
import { toast } from "react-toastify";

const useTranslate = () => {
  const [translatedText, setTranslatedText] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false)

  const translateText = async (text, fromLanguage, toLanguage) => {
    if (!toLanguage || fromLanguage === toLanguage) {
      toast.error("Error: Please select a different language to translate to");
      return;
    }

    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
    
      const isSupported = translatorCapabilities.languagePairAvailable(
        fromLanguage,
        toLanguage
      );

      if (isSupported === 'no') {
        toast.error("Translation not supported for this language pair.");
        return;
      }

      setTranslationLoading(true)
      if(isSupported === 'after-download') toast.info(`Downloading the translation pair. This might take a while`)
      
        const translator = await self.ai.translator.create({
        sourceLanguage: fromLanguage,
        targetLanguage: toLanguage,
      });

      const translation = await translator.translate(text);
      setTranslatedText(translation);
    } catch (error) {
      console.error(error);
    }finally{
        setTranslationLoading(false)
    }
  };

  const resetTranslation = () => setTranslatedText("");

  return { translatedText, translateText, resetTranslation, translationLoading};
};

export default useTranslate;
