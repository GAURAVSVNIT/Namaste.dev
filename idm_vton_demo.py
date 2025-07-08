from diffusers import DiffusionPipeline
from diffusers.utils import load_image

pipe = DiffusionPipeline.from_pretrained("yisol/IDM-VTON")

prompt = "Turn this cat into a dog"
input_image = load_image("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/cat.png")

image = pipe(image=input_image, prompt=prompt).images[0]
