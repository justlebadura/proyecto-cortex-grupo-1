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

# Visualización de la derivada como límite de la pendiente de la secante
from manim import *

class Solution(Scene):
    def construct(self):
        # Configuración del plano cartesiano
        plane = NumberPlane(
            x_range=[-3, 3, 1],
            y_range=[-1, 9, 1],
            x_length=7,
            y_length=5,
            axis_config={"include_numbers": True}
        )
        self.add(plane)

        # Definición de la función f(x) = x^2
        f = lambda x: x**2
        curve = plane.plot(f, x_range=[-2, 2], color=BLUE)
        self.add(curve)

        # Punto fijo en la curva
        x_a = 1.0
        dot_a = Dot(plane.c2p(x_a, f(x_a)), color=WHITE)
        self.add(dot_a)

        # Tracker para el valor de h
        h_tracker = ValueTracker(1.0)

        # Línea secante dinámica
        secante = always_redraw(lambda: Line(
            plane.c2p(x_a, f(x_a)),
            plane.c2p(x_a + h_tracker.get_value(), f(x_a + h_tracker.get_value())),
            color=YELLOW
        ))
        self.add(secante)

        # Etiqueta para h
        h_label = always_redraw(lambda: MathTex(
            f"h = {h_tracker.get_value():.2f}"
        ).next_to(plane.c2p(x_a + h_tracker.get_value(), f(x_a + h_tracker.get_value())), UP))
        self.add(h_label)

        # Animación: h tiende a cero
        self.play(h_tracker.animate.set_value(0.01), run_time=5)
        self.wait(3)

if __name__ == '__main__':
    pass
