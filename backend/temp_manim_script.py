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

# Visualización del producto cruz y el área del paralelogramo
from manim import *

class Solution(ThreeDScene):
    def construct(self):
        # Configuración del espacio 3D
        axes = ThreeDAxes()
        self.add(axes)

        # Definición de los vectores u y v
        u = np.array([2, 1, 0])
        v = np.array([1, 3, 0])

        # Creación de flechas para los vectores
        vector_u = Arrow3D(start=ORIGIN, end=u, color=BLUE)
        vector_v = Arrow3D(start=ORIGIN, end=v, color=GREEN)

        # Cálculo del producto cruz
        cross_product = np.cross(u, v)
        vector_cross = Arrow3D(start=ORIGIN, end=cross_product, color=RED)

        # Creación del paralelogramo
        parallelogram = Polygon(
            ORIGIN, u, u + v, v,
            color=YELLOW, fill_opacity=0.5
        )

        # Agregar objetos a la escena
        self.add(vector_u, vector_v, vector_cross, parallelogram)

        # Animación de rotación para observar el paralelogramo y el vector perpendicular
        self.play(Create(vector_u), Create(vector_v))
        self.play(Create(parallelogram))
        self.play(Create(vector_cross))
        self.move_camera(phi=75 * DEGREES, theta=-45 * DEGREES, run_time=5)
        self.wait(3)

if __name__ == '__main__':
    pass
