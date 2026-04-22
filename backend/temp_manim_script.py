from manim import *

# Monkey patch Axes.get_tangent_line for compatibility
try:
    if not hasattr(CoordinateSystem, "get_tangent_line"):
        def get_tangent_line(self, x, graph, length=5, color=RED):
            angle = self.angle_of_tangent(x, graph)
            point = self.input_to_graph_point(x, graph)
            line = Line(LEFT, RIGHT, color=color).set_length(length)
            line.rotate(angle)
            line.move_to(point)
            return line
        CoordinateSystem.get_tangent_line = get_tangent_line
except NameError:
    pass # CoordinateSystem might not be available or named differently

# Visualización de la derivada como el límite de una secante que se convierte en tangente
from manim import *

class Solution(Scene):
    def construct(self):
        # Crear el plano cartesiano
        plane = NumberPlane(x_range=[-1, 4], y_range=[-1, 8], background_line_style={"stroke_opacity": 0.4})
        self.add(plane)

        # Definir la función y su gráfica
        func = lambda x: x**2
        graph = plane.plot(func, color=BLUE)
        self.add(graph)

        # Puntos en la curva
        a = ValueTracker(1)
        h = ValueTracker(1)

        dot_a = always_redraw(lambda: Dot(plane.c2p(a.get_value(), func(a.get_value())), color=RED))
        dot_b = always_redraw(lambda: Dot(plane.c2p(a.get_value() + h.get_value(), func(a.get_value() + h.get_value())), color=YELLOW))

        # Línea secante
        secant_line = always_redraw(lambda: Line(
            start=plane.c2p(a.get_value(), func(a.get_value())),
            end=plane.c2p(a.get_value() + h.get_value(), func(a.get_value() + h.get_value())),
            color=GREEN
        ))

        # Añadir elementos a la escena
        self.add(dot_a, dot_b, secant_line)

        # Animar el acercamiento de h a 0
        self.play(h.animate.set_value(0), run_time=5)
        self.wait(2)

if __name__ == '__main__':
    pass
