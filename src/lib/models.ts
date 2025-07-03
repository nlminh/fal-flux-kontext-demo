export interface StyleModel {
  id: string;
  name: string;
  imageSrc: string;
  prompt: string;
  loraUrl?: string;
}

export const styleModels: StyleModel[] = [
  {
    id: "broccoli",
    name: "Broccoli Hair",
    imageSrc: "/images/styles/broccoli.jpeg",
    prompt: "Change hair to a broccoli haircut",
    loraUrl:
      "https://huggingface.co/fal/Broccoli-Hair-Kontext-Dev-LoRA/resolve/main/broccoli-hair-kontext-dev-lora.safetensors",
  },
  {
    id: "plushie",
    name: "Plushie Style",
    imageSrc: "/images/styles/plushie.png",
    prompt: "Convert to plushie style",
    loraUrl:
      "https://huggingface.co/fal/Plushie-Kontext-Dev-LoRA/resolve/main/plushie-kontext-dev-lora.safetensors",
  },
  {
    id: "wojak",
    name: "Wojak Style",
    imageSrc: "/images/styles/wojack.jpg",
    prompt: "Convert to wojak style drawing",
    loraUrl:
      "https://huggingface.co/fal/Wojak-Kontext-Dev-LoRA/resolve/main/wojak-kontext-dev-lora.safetensors",
  },
  {
    id: "fluffy",
    name: "Fluffy Style",
    imageSrc: "/images/styles/fluffy.jpg",
    prompt: "make this object fluffy",
  },
  {
    id: "glassprism",
    name: "Glass Prism",
    imageSrc: "/images/styles/glassprism.jpg",
    prompt:
      "make the character/object look like it was made out of glass, black background",
  },
  {
    id: "bighead",
    name: "Big Head",
    imageSrc: "/images/styles/bighead.jpg",
    prompt: "give this person a big head",
  },
  {
    id: "simpsons",
    name: "Simpsons Style",
    imageSrc: "/images/styles/simpsons.jpg",
    prompt: "convert to Simpsons cartoon style",
  },
  {
    id: "anime",
    name: "Anime Style",
    imageSrc: "/images/styles/anime.jpg",
    prompt: "convert to anime art style with large eyes and stylized features",
  },
];
