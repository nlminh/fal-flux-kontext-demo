"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { styleModels } from "@/lib/models";
import type { StyleModel } from "@/lib/models";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import {
  Download,
  AlertCircle,
  Plus,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SpinnerIcon } from "@/components/ui/icons";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/logo";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useMutation } from "@tanstack/react-query";

// Shortcut badge component
const ShortcutBadge = ({ shortcut }: { shortcut: string }) => {
  const keySymbolMap: Record<string, string> = {
    meta: "⌘",
    ctrl: "⌃",
    enter: "↵",
  };

  const keys = shortcut
    .split("+")
    .map((key) => keySymbolMap[key.trim()] ?? key.trim());

  return (
    <span className="flex flex-row space-x-0.5">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-1.5 py-0.5 text-xs bg-surface-alpha-strong rounded font-mono"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
};

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Flux Kontext Dev",
  description:
    "Transform your photos with AI-powered style transfer in seconds using LoRA models and prompt-based styles.",
  url:
    process.env.NEXT_PUBLIC_APP_URL || "https://flux-kontext-demo.vercel.app",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "fal.ai",
    url: "https://fal.ai",
  },
  featureList: [
    "AI Style Transfer",
    "LoRA Model Support",
    "Multiple Art Styles",
    "Real-time Generation",
    "High-Quality Output",
  ],
};

export default function SetupPage() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [selectedExampleImage, setSelectedExampleImage] = useState<
    string | null
  >(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [streamingImage, setStreamingImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomLoRA, setShowCustomLoRA] = useState(false);
  const [customLoRAUrl, setCustomLoRAUrl] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [streamingProgress, setStreamingProgress] = useState<string | null>(
    null,
  );
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const dragCounter = useRef(0);
  
  // Locked generation parameters - set when generation starts
  const [lockedGenerationParams, setLockedGenerationParams] = useState<{
    imageUrl: string;
    prompt: string;
    loraUrl?: string;
  } | null>(null);

  const trpc = useTRPC();

  const { mutateAsync: uploadImage } = useMutation(
    trpc.uploadImage.mutationOptions(),
  );

  // Setup the subscription for image generation streaming
  const subscription = useSubscription(
    trpc.generateImageStream.subscriptionOptions(
      lockedGenerationParams || {
        imageUrl: "",
        prompt: "",
      },
      {
        enabled: isGenerating && !!lockedGenerationParams,
        onData: (data: any) => {
          const eventData = data.data;

          if (eventData.type === "progress") {
            const event = eventData.data;

            if (event.images && event.images.length > 0) {
              const newImageUrl = event.images[0].url;

              const img = new window.Image();
              img.onload = () => {
                setStreamingImage(newImageUrl);
              };
              img.src = newImageUrl;
            }
          } else if (eventData.type === "complete") {
            setGeneratedImage(eventData.imageUrl);
            setStreamingImage(null);
            setIsGenerating(false);
            setStreamingProgress(null);
            setProgressPercent(0);
            setLockedGenerationParams(null);
          } else if (eventData.type === "error") {
            setError(eventData.error);
            setStreamingImage(null);
            setIsGenerating(false);
            setStreamingProgress(null);
            setProgressPercent(0);
            setLockedGenerationParams(null);
          }
        },
        onError: (error) => {
          console.error("Subscription error:", error);
          setError(
            error.message || "An unexpected error occurred. Please try again.",
          );
          setIsGenerating(false);
          setStreamingImage(null);
          setStreamingProgress(null);
          setProgressPercent(0);
          setLockedGenerationParams(null);
        },
      },
    ),
  );

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputImage(event.target?.result as string);
          setSelectedExampleImage(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleGenerate = async () => {
    const isCustom = selectedStyle === "custom";
    const selectedModel = isCustom
      ? null
      : styleModels.find((m) => m.id === selectedStyle);

    if (
      inputImage &&
      (selectedModel || (isCustom && customPrompt)) &&
      !isGenerating
    ) {
      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      setStreamingImage(null);
      setStreamingProgress(null);
      setProgressPercent(0);

      setTimeout(() => {
        // Find the output section and scroll it to center of viewport
        const outputSection = document.getElementById('output-section');
        if (outputSection) {
          const rect = outputSection.getBoundingClientRect();
          const absoluteTop = rect.top + window.pageYOffset;
          const viewportHeight = window.innerHeight;
          const elementHeight = rect.height;
          
          // Calculate position to center the element in viewport
          const scrollToPosition = absoluteTop - (viewportHeight / 2) + (elementHeight / 2);
          
          window.scrollTo({
            top: Math.max(0, scrollToPosition),
            behavior: "smooth",
          });
        }
      }, 100);

      setStreamingProgress("Uploading image...");

      try {
        const uploadResult = await uploadImage({
          image: inputImage,
        });

        setUploadedImageUrl(uploadResult.url);
        
        // Lock in the generation parameters at the time of clicking Generate
        const prompt = isCustom 
          ? customPrompt 
          : selectedModel?.prompt || "";
        const loraUrl = isCustom 
          ? customLoRAUrl 
          : selectedModel?.loraUrl;
        
        setLockedGenerationParams({
          imageUrl: uploadResult.url,
          prompt,
          ...(loraUrl ? { loraUrl } : {}),
        });
        
        setStreamingProgress("Starting generation...");
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload image",
        );
        setIsGenerating(false);
        setStreamingImage(null);
        setStreamingProgress(null);
        setLockedGenerationParams(null);
      }
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputImage, selectedStyle, isGenerating]);

  const handleDragEvents = (e: React.DragEvent, enter: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (enter) {
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    } else {
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    handleFileChange(e.dataTransfer.files);
  };

  const checkOS = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return "meta+enter";
    }
    return navigator.platform.startsWith("Win") ||
      navigator.platform.startsWith("Linux")
      ? "ctrl+enter"
      : "meta+enter";
  };

  const handleApplyAnotherStyle = () => {
    if (generatedImage) {
      setInputImage(generatedImage);
      setSelectedExampleImage(null);
      setUploadedImageUrl(null);
      setStreamingImage(null);
      setError(null);
      setSelectedStyle(null);
      setShowCustomLoRA(false);
      setCustomLoRAUrl("");
      setCustomPrompt("");
      setLockedGenerationParams(null);
      // Scroll back to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div
        className="bg-background min-h-screen text-foreground font-focal relative overflow-hidden flex flex-col"
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm">
            <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
              <Download className="h-16 w-16 text-card" />
              <p className="max-w-lg text-center text-2xl font-medium text-card">
                Drop file(s) here
              </p>
            </div>
          </div>
        )}

        <header className="w-full py-6 px-4 relative z-10">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="https://fal.ai" target="_blank">
              <Logo className="h-8 w-16 text-foreground" />
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 flex-1 flex flex-col">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground">
              Flux Kontext Dev
            </h1>
            <p className="text-lg text-foreground font-hal max-w-2xl mx-auto mt-4">
              Transform your photos with AI-powered style transfer in seconds
            </p>
          </div>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col h-full">
              <Card
                className={cn(
                  "h-full transition-all duration-300 bg-card/80 border-border shadow-sm backdrop-blur-sm",
                )}
              >
                <CardHeader className="space-y-1 text-center pb-2">
                  <div className="mx-auto h-10 w-10 rounded bg-destructive/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-destructive">
                      1
                    </span>
                  </div>
                  <CardDescription>
                    Click to upload image or drag & drop your image
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div
                    className="relative h-[400px] w-full rounded bg-muted border border-dashed border-border flex items-center justify-center text-center cursor-pointer hover:bg-muted/70 hover:border-primary transition-all group"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                    {inputImage ? (
                      <>
                        <Image
                          src={inputImage}
                          alt="Input preview"
                          fill
                          className="object-contain rounded"
                        />
                        <div className="absolute inset-0 bg-foreground/30 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-card text-center space-y-2">
                            <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                            <p className="font-medium">Click to change image</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground space-y-3">
                        <ImageIcon className="mx-auto h-12 w-12 mb-4 text-foreground" />
                        <p className="font-medium text-lg text-foreground">
                          Click to upload image or drag & drop
                        </p>
                        <p className="text-sm font-hal">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Or try an example:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => {
                        const examplePath = `/images/community/${num}.jpg`;
                        const isSelected = selectedExampleImage === examplePath;
                        return (
                          <div
                            key={num}
                            onClick={async () => {
                              const response = await fetch(examplePath);
                              const blob = await response.blob();
                              const reader = new FileReader();
                              reader.onload = () => {
                                setInputImage(reader.result as string);
                                setSelectedExampleImage(examplePath);
                              };
                              reader.readAsDataURL(blob);
                            }}
                            className={cn(
                              "flex aspect-square items-center justify-center",
                              "relative cursor-pointer overflow-hidden",
                              "rounded border border-border hover:border-primary",
                              "data-[selected=true]:border-primary data-[selected=true]:p-[2px]",
                            )}
                            data-selected={isSelected}
                          >
                            {isSelected && (
                              <div className="pointer-events-none absolute inset-0 m-[2px] flex justify-end bg-foreground/40">
                                <CheckCircle2 className="m-1 h-4 w-4 fill-primary stroke-card stroke-[1.5px]" />
                              </div>
                            )}
                            <img
                              src={examplePath}
                              alt={`Example ${num}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col h-full gap-4">
              <Card className="bg-card/80 border-border shadow-sm flex-1">
                <CardHeader className="space-y-1 text-center pb-2">
                  <div className="mx-auto h-10 w-10 rounded bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      2
                    </span>
                  </div>
                  <CardDescription>
                    Select a style to transform your image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {styleModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => {
                          setSelectedStyle(model.id);
                          setShowCustomLoRA(false);
                          setCustomPrompt("");
                        }}
                        className={cn(
                          "flex aspect-square items-center justify-center",
                          "relative cursor-pointer overflow-hidden",
                          "rounded border border-border hover:border-primary",
                          "data-[selected=true]:border-primary data-[selected=true]:p-[2px]",
                        )}
                        data-selected={
                          selectedStyle === model.id && !showCustomLoRA
                        }
                      >
                        {selectedStyle === model.id && !showCustomLoRA && (
                          <div className="pointer-events-none absolute inset-0 m-[2px] flex justify-end bg-foreground/40">
                            <CheckCircle2 className="m-1 h-6 w-6 fill-primary stroke-card stroke-[1.5px]" />
                          </div>
                        )}
                        {model.loraUrl && (
                          <div className="absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[0.6rem] font-medium px-1 py-0.5">
                            LoRA
                          </div>
                        )}
                        <img
                          src={model.imageSrc}
                          alt={model.name}
                          className="h-full w-full object-cover"
                        />
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 bg-foreground/60 text-card text-xs font-medium px-2 py-1 text-center",
                            selectedStyle === model.id &&
                              !showCustomLoRA &&
                              "bottom-[2px] left-[2px] right-[2px]",
                          )}
                        >
                          {model.name}
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={() => {
                        setShowCustomLoRA(!showCustomLoRA);
                        if (!showCustomLoRA) {
                          setSelectedStyle("custom");
                        } else {
                          setSelectedStyle(null);
                          setCustomPrompt("");
                        }
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center",
                        "relative cursor-pointer overflow-hidden",
                        "rounded border border-dashed",
                        showCustomLoRA
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary",
                      )}
                    >
                      <Plus
                        className={cn(
                          "h-8 w-8 transition-transform duration-200",
                          showCustomLoRA
                            ? "rotate-45 text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                  </div>

                  {showCustomLoRA && (
                    <div className="mb-4 space-y-4 mt-4">
                      <div>
                        <Label
                          htmlFor="custom-lora"
                          className="text-sm font-medium mb-2 block"
                        >
                          LoRA URL (Optional)
                        </Label>
                        <Input
                          id="custom-lora"
                          type="url"
                          placeholder="Kontext Dev LoRA URL (optional)"
                          value={customLoRAUrl}
                          onChange={(e) => setCustomLoRAUrl(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="custom-prompt"
                          className="text-sm font-medium mb-2 block"
                        >
                          Custom Prompt
                        </Label>
                        <Textarea
                          id="custom-prompt"
                          placeholder="Describe what you want to generate (e.g., 'A portrait of a person with...')"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full min-h-[80px] resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={
                  !inputImage ||
                  !selectedStyle ||
                  (selectedStyle === "custom" && !customPrompt) ||
                  isGenerating
                }
                className={cn("w-full text-lg py-6 font-medium transition-all")}
                variant="primary"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 animate-spin stroke-current" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <div className="flex flex-row items-center space-x-2">
                      <span>Generate</span>
                      <ShortcutBadge shortcut={checkOS()} />
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </main>

          {(isGenerating || generatedImage || error) && (
            <div id="output-section" className="mt-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <Card className="bg-card/80 border-border shadow-sm">
                <CardHeader className="space-y-1 text-center pb-2">
                  <div className="mx-auto h-10 w-10 rounded bg-accent/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-accent">3</span>
                  </div>
                  <CardDescription>
                    {isGenerating
                      ? "Generating your styled image..."
                      : "Your transformed image"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {error ? (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                      <p className="text-destructive font-medium">{error}</p>
                      <Button
                        onClick={() => {
                          setError(null);
                          setLockedGenerationParams(null);
                        }}
                        variant="secondary"
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-hidden relative h-[400px] w-full">
                        {(streamingImage || generatedImage) && (
                          <Image
                            src={generatedImage || streamingImage || ""}
                            alt={
                              isGenerating
                                ? "Generation preview"
                                : "Generated result"
                            }
                            fill
                            className={cn(
                              "object-contain transition-opacity duration-300",
                            )}
                          />
                        )}
                        {isGenerating && !streamingImage && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <LoadingAnimation
                              isLoading={true}
                              loadingMessage={
                                streamingProgress ||
                                "Generating your styled image..."
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.download = `styled-${Date.now()}.png`;
                            link.href = generatedImage || "";
                            link.click();
                          }}
                          variant="primary"
                          className={`gap-2 ${generatedImage ? "opacity-100" : "opacity-0"}`}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={handleApplyAnotherStyle}
                          variant="secondary"
                          className={`gap-2 ${generatedImage ? "opacity-100" : "opacity-0"}`}
                        >
                          Apply Another Style
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="py-12"></div>
          <div className="md:mt-auto py-4 border-t border-border">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <span className="text-sm">Powered by</span>
                <Link
                  href="https://fal.ai"
                  target="_blank"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Logo className="h-6 w-12 text-foreground" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="https://fal.ai/docs"
                  target="_blank"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Build Your Own AI App
                </Link>

                <Link
                  href="https://github.com/fal-ai-community/fal-flux-kontext-demo"
                  target="_blank"
                  className={buttonVariants({ size: "sm" })}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="#000000"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Source Code
                </Link>
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                This demo showcases fal's powerful AI image generation
                capabilities. Build your own AI-powered applications with our
                fast, scalable infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
