import { useState } from "react";
import { toast } from "react-toastify";

const useTranslate = () => {
  const [translatedText, setTranslatedText] = useState("");

  const translateText = async (text, fromLanguage, toLanguage) => {
    console.log(`Translating from ${fromLanguage}`)
    console.log(`Translating to ${toLanguage}`)

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

      if (!isSupported) {
        toast.error("Translation not supported for this language pair.");
        return;
      }

      const translator = await self.ai.translator.create({
        sourceLanguage: fromLanguage,
        targetLanguage: toLanguage,
      });

      const translation = await translator.translate(text);
      setTranslatedText(translation);
    } catch (error) {
      console.error(error);
    }
  };

  const resetTranslation = () => setTranslatedText("");

  return { translatedText, translateText, resetTranslation };
};

export default useTranslate;
