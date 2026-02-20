# Mock Manim for environments without Cairo/FFmpeg
# This allows the code to "run" without actually rendering video, preventing crashes.

class Scene:
    def __init__(self, *args, **kwargs):
        pass
    def construct(self):
        pass
    def play(self, *args, **kwargs):
        pass
    def wait(self, *args, **kwargs):
        pass
    def add(self, *args, **kwargs):
        pass
    def remove(self, *args, **kwargs):
        pass

class Mobject:
    def __init__(self, *args, **kwargs):
        pass
    def shift(self, *args, **kwargs):
        return self
    def scale(self, *args, **kwargs):
        return self
    def rotate(self, *args, **kwargs):
        return self
    def move_to(self, *args, **kwargs):
        return self
    def next_to(self, *args, **kwargs):
        return self
    def align_to(self, *args, **kwargs):
        return self
    def set_color(self, *args, **kwargs):
        return self
    def set_opacity(self, *args, **kwargs):
        return self
    def animate(self, *args, **kwargs):
        return self

# Geometries
class Circle(Mobject): pass
class Square(Mobject): pass
class Rectangle(Mobject): pass
class Line(Mobject): pass
class Arrow(Mobject): pass
class Polygon(Mobject): pass
class RegularPolygon(Mobject): pass
class Triangle(Mobject): pass
class Ellipse(Mobject): pass
class Annulus(Mobject): pass
class Dot(Mobject): pass

# Text / SVGs
class Text(Mobject): pass
class Tex(Mobject): pass
class MathTex(Mobject): pass
class SVGMobject(Mobject): pass
class ImageMobject(Mobject): pass

# Animations
class Animation:
    def __init__(self, *args, **kwargs):
        pass

class Create(Animation): pass
class Write(Animation): pass
class FadeIn(Animation): pass
class FadeOut(Animation): pass
class Transform(Animation): pass
class ReplacementTransform(Animation): pass
class Rotate(Animation): pass
class MoveToTarget(Animation): pass
class ApplyMethod(Animation): pass
class Uncreate(Animation): pass
class DrawBorderThenFill(Animation): pass
class ShowCreation(Animation): pass
class GrowFromCenter(Animation): pass

# Constants and Config
config = type('Config', (), {'pixel_height': 1080, 'pixel_width': 1920, 'frame_height': 8.0, 'frame_width': 14.2})()
PI = 3.14159
TAU = 6.28318
DEGREES = TAU / 360

# Colors
WHITE = "#FFFFFF"
BLACK = "#000000"
RED = "#FF0000"
GREEN = "#00FF00"
BLUE = "#0000FF"
YELLOW = "#FFFF00"
CYAN = "#00FFFF"
MAGENTA = "#FF00FF"
ORANGE = "#FF8000"
PURPLE = "#800080"
GREY = "#808080"
TEAL = "#008080"
GOLD = "#FFD700"
MAROON = "#800000"

# Utils
def VGroup(*args):
    return Mobject()

def always_redraw(func):
    return func()

