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

from manim import *
import numpy as np

class Solution(Scene):
    def construct(self):
        # Crear los ejes
        axes = Axes(
            x_range=[-2 * PI, 2 * PI, PI / 2],  # Rango de x
            y_range=[-1.5, 1.5, 0.5],          # Rango de y
            x_length=10,                       # Largo del eje x
            y_length=4,                        # Largo del eje y
            axis_config={"color": WHITE},      # Color de los ejes
            tips=True                          # Mostrar flechas en los ejes
        )
        
        # Etiquetas de los ejes
        labels = axes.get_axis_labels(x_label="x", y_label="y")

        # Definir la función seno
        sin_graph = axes.plot(
            lambda x: np.sin(x), 
            color=YELLOW, 
            x_range=[-2 * PI, 2 * PI]
        )
        
        # Etiquetas de puntos importantes en la gráfica
        sin_label = MathTex(r"y = \sin(x)").next_to(axes, UP)

        # Crear puntos específicos en la gráfica
        points = [
            (-2 * PI, 0), (-3 * PI / 2, -1), (-PI, 0), 
            (-PI / 2, 1), (0, 0), (PI / 2, 1), 
            (PI, 0), (3 * PI / 2, -1), (2 * PI, 0)
        ]
        dots = VGroup(*[Dot(axes.c2p(x, y), color=RED) for x, y in points])

        # Etiquetas de los puntos
        point_labels = VGroup(
            *[MathTex(f"({round(x, 2)}, {y})").scale(0.5).next_to(axes.c2p(x, y), UP) for x, y in points]
        )

        # Animaciones
        self.play(Create(axes), Write(labels))       # Crear los ejes
        self.play(Create(sin_graph), Write(sin_label))  # Crear la gráfica de seno
        self.play(FadeIn(dots), Write(point_labels)) # Mostrar los puntos importantes

        self.wait(3)  # Esperar para visualizar

if __name__ == '__main__':
    pass
