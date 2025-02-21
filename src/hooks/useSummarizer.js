import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";


const useSummarizer = () =>{
    const summarizerRef = useRef(null)
    const [summarizedText, setSummarizedText] = useState("")
    const [loading, setLoading] = useState(false)
    

    useEffect(() => {
        async function checkSummarizerCapabilities() {
          try {
            if (!("ai" in self) || !("summarizer" in self.ai)) {
              toast.error(
                "AI Summarizer API is not available in this environment."
              );
              return;
            }

            const capabilities = await self.ai.summarizer.capabilities();
    
            if (capabilities.available === "no") {
              toast.error("Summarizer API is not available.");
              summarizerRef.current = await self.ai.summarizer.create({
                monitor(m) {
                  m.addEventListener("downloadprogress", (e) => {
                    console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                  });
                },
              });
            }
    
            // If available, initialize it
            summarizerRef.current = await self.ai.summarizer.create();
            await summarizerRef.current.ready;
          } catch (error) {
            console.error("Error checking Summarizer capabilities:", error);
          }
        }
    
        checkSummarizerCapabilities();
      }, []);

      const summarizeText = async(text) =>{
          if (!summarizerRef.current) {
            toast.error("Summarizer AI not enabled.");
            return;
          }
      
          if (text.length < 150) {
            toast.error("Message must be at least 150 characters for summarization.");
            return;
          }
          setLoading(true)
          if (text.length >= 150) {
            try {
              const summary = await summarizerRef.current.summarize(text);
              setSummarizedText(summary);
            } catch (error) {
                console.error(error)
              toast.error("Failed to Summarize text. Check Summarization AI");
            }finally{
                setLoading(false)
            }
          }
        }

        return {summarizedText, summarizeText, loading}
}

export default useSummarizer;