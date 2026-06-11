import importlib
import inspect
import pkgutil
from pathlib import Path

from app.enrichments.base import BaseTransform


class TransformRegistry:
    """
    Auto-discovers every file in the enrichments/ package that defines a
    concrete subclass of BaseTransform, then exposes them by slug.
    """

    def __init__(self) -> None:
        self._transforms: dict[str, BaseTransform] = {}
        self._discover()

    def _discover(self) -> None:
        enrichments_dir = Path(__file__).parent
        for _, module_name, _ in pkgutil.iter_modules([str(enrichments_dir)]):
            if module_name in ("base", "registry"):
                continue
            module = importlib.import_module(f"app.enrichments.{module_name}")
            for _, obj in inspect.getmembers(module, inspect.isclass):
                if (
                    issubclass(obj, BaseTransform)
                    and obj is not BaseTransform
                    and hasattr(obj, "slug")
                ):
                    try:
                        instance: BaseTransform = obj()
                        self._transforms[instance.slug] = instance
                    except Exception:
                        pass  # skip broken transforms silently

    def get_all(self) -> list[BaseTransform]:
        return list(self._transforms.values())

    def get_for_entity(self, entity_type: str) -> list[BaseTransform]:
        return [t for t in self._transforms.values() if entity_type in t.accepts]

    def get(self, slug: str) -> BaseTransform | None:
        return self._transforms.get(slug)

    async def run(self, slug: str, value: str, api_key: str | None) -> dict:
        transform = self._transforms.get(slug)
        if not transform:
            raise ValueError(f"No transform registered with slug: {slug!r}")
        return await transform.run(value, api_key)


# Module-level singleton — imported by the router
registry = TransformRegistry()
