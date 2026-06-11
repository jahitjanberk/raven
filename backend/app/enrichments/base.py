import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


def safe_error(exc: Exception, context: str = "") -> str:
    """
    Log the full exception server-side and return a generic message
    safe for sending to the client. Never expose internal paths,
    connection strings, hostnames, or stack traces to the frontend.
    """
    logger.exception("Transform error%s: %s", f" ({context})" if context else "", exc)
    exc_type = type(exc).__name__
    # Allow common, safe network error types through verbatim
    safe_types = {"ConnectTimeout", "ReadTimeout", "ConnectError", "TimeoutException"}
    if exc_type in safe_types:
        return f"Network error: {exc_type}"
    return f"Transform error ({exc_type})"


class BaseTransform(ABC):
    """
    Every transform subclasses this and is auto-discovered by TransformRegistry.

    Class-level attributes declare the transform's metadata; only `run` is
    instance-level behaviour.
    """

    name: str           # Human display name, e.g. "Shodan IP Lookup"
    slug: str           # Unique machine identifier, e.g. "shodan_ip"
    description: str    # One-line summary shown in the UI
    accepts: list[str]  # Entity types this transform accepts, e.g. ["ip"]
    returns: list[str]  # Entity types it can produce, e.g. ["org", "domain"]
    requires_key: bool = False
    tier: str = "free"       # "free" | "pro"
    category: str = "General"  # UI grouping label

    @abstractmethod
    async def run(self, value: str, api_key: str | None) -> dict:
        """
        Execute the transform.

        Returns:
            {
                "nodes": [
                    {
                        "type": str,        # EntityType slug, e.g. "ip"
                        "value": str,       # The node's primary value
                        "source_url": str | None,
                        "note": str | None,
                    },
                    ...
                ],
                "edges": [
                    {
                        "source": int,      # 0-based index into returned nodes
                        "target": int,
                        "label": str | None,
                    },
                    ...
                ],
                "error": str | None,        # present only on failure
            }
        """
        ...

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "accepts": self.accepts,
            "returns": self.returns,
            "requires_key": self.requires_key,
            "tier": self.tier,
            "category": self.category,
        }
