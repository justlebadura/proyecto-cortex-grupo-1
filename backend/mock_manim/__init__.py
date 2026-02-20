# Mock de Manim para evitar errores de importación
# y redirigir la lógica a Matplotlib si es posible, o simplemente evitar crash.

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
    # Animate prop mock
    @property
    def animate(self):
        return self

class Mobject:
    def __init__(self, *args, **kwargs):
        pass
    def set_z_index(self, *args, **kwargs):
        return self
    def next_to(self, *args, **kwargs):
        return self
    def shift(self, *args, **kwargs):
        return self
    def scale(self, *args, **kwargs):
        return self
    def animate(self, *args, **kwargs):
        return self
    def set_value(self, *args, **kwargs):
        return self

class VMobject(Mobject):
    pass

class SVGMobject(VMobject):
    pass

class Text(Mobject):
    def __init__(self, text, **kwargs):
        pass

class MathTex(Mobject):
    def __init__(self, text, **kwargs):
        pass

class Circle(Mobject):
    def __init__(self, **kwargs):
        pass

class Square(Mobject):
    def __init__(self, **kwargs):
        pass

class Dot(Mobject):
    def __init__(self, point=None, **kwargs):
        pass

class Line(Mobject):
    def __init__(self, start=None, end=None, **kwargs):
        pass
    # Mocking animate.set_value calls
    def set_value(self, val):
        return self

class Axes(Mobject):
    def __init__(self, **kwargs):
        pass
    def get_axis_labels(self, **kwargs):
        return Mobject()
    def plot(self, function, **kwargs):
        return Mobject()
    def c2p(self, *args):
        return [0,0,0]
    def get_line_graph(self, **kwargs):
        return Mobject()

class ValueTracker(Mobject):
    def __init__(self, value=0):
        self.value = value
    def get_value(self):
        return self.value
    def set_value(self, value):
        self.value = value
        return self

# Animations
def Create(*args, **kwargs): return Mobject()
def Write(*args, **kwargs): return Mobject()
def FadeIn(*args, **kwargs): return Mobject()
def FadeOut(*args, **kwargs): return Mobject()
def Transform(*args, **kwargs): return Mobject()
def ReplacementTransform(*args, **kwargs): return Mobject()

def always_redraw(func):
    return func()

# Colors
BLUE = "#58C4DD"
GREEN = "#83C167"
YELLOW = "#FFFF00"
RED = "#FC6255"
WHITE = "#FFFFFF"
BLACK = "#000000"
