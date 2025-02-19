import React, { useEffect, useState } from "react";
import styles from "./chat.module.css";
import { Logo } from "../../assets";
import { Link } from "react-router-dom";

const languages = [
  {
    name: "English",
    value: "en",
  },
  {
    name: "Portuguese",
    value: "pt",
  },
  {
    name: "Turkish",
    value: "tr",
  },
  {
    name: "French",
    value: "fr",
  },
  {
    name: "Spanish",
    value: "es",
  },
  {
    name: "Russian",
    value: "ru",
  },
];

const Chat = () => {
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [aidetectedLanguage, setAiDetectedLanguage] = useState(null);
  const [detector, setDetector] = useState(null);
  const [translatedLanguage, setTranslatedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  function displayMessage(e) {
    e.preventDefault();
    setSubmittedMessage(message);
  }

  useEffect(() => {
    async function checkLanguageDetectorAI() {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;
      let detectorInstance;

      if (canDetect === "no") {
        return;
      }

      if (canDetect === "readily") {
        // The language detector can immediately be used.
        detectorInstance = await self.ai.languageDetector.create();
      } else {
        // The language detector can be used after model download.
        detectorInstance = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        await detectorInstance.ready;
      }
      setDetector(detectorInstance);
    }
    checkLanguageDetectorAI();
  }, []);

  useEffect(() => {
    async function detectMessageLanguage() {
      if (!detector || !submittedMessage) return;

      try {
        const results = await detector.detect(submittedMessage);
        const highestConfidence = results.reduce(
          (max, result) => (result.confidence > max.confidence ? result : max),
          results[0]
        );

        const { detectedLanguage, confidence } = highestConfidence;
        setAiDetectedLanguage({
          detectedLanguage,
          languageValue: languageTagToHumanReadable(detectedLanguage, "en"),
          confidence: (confidence * 100).toFixed(1),
        });
      } catch (error) {
        console.error(`Detection error: ${error}`);
      }
    }
    detectMessageLanguage();
  }, [submittedMessage, detector]);

  useEffect(() => {
    async function translateMessage() {
      if (!submittedMessage || !translatedLanguage || !aidetectedLanguage)
        return;

      try {
        const translatorCapabilities = await self.ai.translator.capabilities();
        const isSupported = translatorCapabilities.languagePairAvailable(
          aidetectedLanguage.detectedLanguage,
          translatedLanguage
        );

        if (!isSupported) {
          console.error("Translation not supported for this language pair.");
          return;
        }

        const translator = await self.ai.translator.create({
          sourceLanguage: aidetectedLanguage.detectedLanguage,
          targetLanguage: translatedLanguage,
        });
        console.log("Detected language:", aidetectedLanguage?.detectedLanguage);
        console.log("Creating translator with:", {
          source: aidetectedLanguage.detectedLanguage,
          target: translatedLanguage,
        });

        const translation = await translator.translate(
          submittedMessage
        );
        setTranslatedText(translation);
      } catch (error) {
        console.error(error);
      }
    }
    translateMessage();
  }, [translatedLanguage, submittedMessage]);

  const languageTagToHumanReadable = (languageTag, targetLanguage) => {
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: "language",
    });
    return displayNames.of(languageTag);
  };

  return (
    <div>
      <header className={styles.header}>
        <img src={Logo} alt="Cognichat Logo" />
        <Link to="/"> Back to Home</Link>
      </header>

      <main>
        <div className={styles.inputArea}>
          <form onSubmit={displayMessage}>
            <textarea
              name="message"
              id="message"
              placeholder="Enter your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button type="submit"> Send </button>
          </form>

          <div className={styles.displayArea}>
            <p className={styles.submittedMessage}> {submittedMessage} </p>
            {aidetectedLanguage && (
              <p className={styles.languageDetect}>
                This is {aidetectedLanguage.confidence}% of{" "}
                {aidetectedLanguage.languageValue}
              </p>
            )}

            <p>{translatedText}</p>

            {submittedMessage && (
              <div className={styles.translateArea}>
                <p>Translate to: </p>
                <select
                  name="translatedLanguage"
                  value={translatedLanguage}
                  onChange={(e) => setTranslatedLanguage(e.target.value)}
                >
                  {languages.map((language) => (
                    <option value={language.value} key={language.value}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export { Chat };
