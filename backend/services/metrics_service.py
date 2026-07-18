from collections import defaultdict
from typing import Dict, Any

class MetricsService:
    def __init__(self):
        # Maps metrics category -> list of durations (in seconds)
        self.metrics = defaultdict(list)

    def record(self, category: str, duration_sec: float):
        """Records a duration metric. Caps log storage at 1000 items to prevent leaks."""
        self.metrics[category].append(duration_sec)
        if len(self.metrics[category]) > 1000:
            self.metrics[category] = self.metrics[category][-1000:]

    def get_stats(self) -> Dict[str, Any]:
        """Calculates count, average (ms) and max (ms) for all metric tracks."""
        stats = {}
        for category, durations in self.metrics.items():
            if not durations:
                stats[category] = {"count": 0, "avg_ms": 0.0, "max_ms": 0.0}
                continue
            avg_sec = sum(durations) / len(durations)
            max_sec = max(durations)
            stats[category] = {
                "count": len(durations),
                "avg_ms": round(avg_sec * 1000, 2),
                "max_ms": round(max_sec * 1000, 2)
            }
        # Guarantee fallbacks for all required tracks
        for expected in ["api_response_time", "gemini_latency", "csv_processing_time", "firestore_duration", "notification_delivery_time"]:
            if expected not in stats:
                stats[expected] = {"count": 0, "avg_ms": 0.0, "max_ms": 0.0}
        return stats

metrics_service = MetricsService()
