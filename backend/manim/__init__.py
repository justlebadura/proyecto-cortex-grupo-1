# Mock Manim Library
# Permite que el código generado por Robert se ejecute sin errores en entornos sin soporte de video real.

class Scene:
    def __init__(self):
        self.objects = []
    
    def play(self, *args, **kwargs):
        print(f"[MockManim] Playing animation: {args}")
        pass
    
    def wait(self, *args, **kwargs):
        pass
        
    def add(self, *args):
        self.objects.extend(args)

    def render(self):
        print("[MockManim] Rendering scene...")

# Geometría
class Mobject:
    def move_to(self, *args): return self
    def scale(self, *args): return self
    def shift(self, *args): return self
    def set_color(self, *args): return self

class Circle(Mobject): pass
class Square(Mobject): pass
class Text(Mobject): 
    def __init__(self, text, **kwargs): pass
class Tex(Mobject):
    def __init__(self, text, **kwargs): pass
class MathTex(Mobject):
    def __init__(self, text, **kwargs): pass
class Line(Mobject): pass
class Arrow(Mobject): pass
class NumberPlane(Mobject):
    def get_graph(self, func, **kwargs): return Mobject()
    def get_axis_labels(self, **kwargs): return Mobject()
class Axes(NumberPlane): pass

# Animaciones
class Create:
    def __init__(self, mobject, **kwargs): pass
class Write:
    def __init__(self, mobject, **kwargs): pass
class FadeIn:
    def __init__(self, mobject, **kwargs): pass
class Transform:
    def __init__(self, mobject, target, **kwargs): pass
class ReplacementTransform(Transform): pass

# Configuración
class config:
    media_dir = "./media"
    verbosity = "WARNING"
    pixel_height = 1080
    pixel_width = 1920

# Constantes de color
BLUE = "#0000FF"
RED = "#FF0000"
GREEN = "#00FF00"
YELLOW = "#FFFF00"
WHITE = "#FFFFFF"
BLACK = "#000000"
GOLD = "#FFD700"

# Constantes de posición
UP = [0, 1, 0]
DOWN = [0, -1, 0]
LEFT = [-1, 0, 0]
RIGHT = [1, 0, 0]
ORIGIN = [0, 0, 0]
