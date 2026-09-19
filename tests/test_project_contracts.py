import json
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]


class FormWiseContractTests(unittest.TestCase):
    def test_required_docs_assets_exist(self):
        required = [
            ROOT / "README.md",
            ROOT / "docs" / "architecture.png",
            ROOT / "docs" / "screenshots" / "landing.png",
            ROOT / "docs" / "screenshots" / "form-builder.png",
            ROOT / "docs" / "screenshots" / "ai-insights.png",
        ]
        for path in required:
            with self.subTest(path=path):
                self.assertTrue(path.exists(), f"Missing required asset: {path}")

    def test_environment_files_are_not_tracked_by_contract(self):
        gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8")
        self.assertIn(".env", gitignore)
        self.assertIn(".env.local", gitignore)

    def test_backend_requirements_include_core_stack(self):
        requirements = (ROOT / "backend" / "requirements.txt").read_text(
            encoding="utf-8"
        )
        for package in ("fastapi", "sqlalchemy", "psycopg", "google-genai"):
            with self.subTest(package=package):
                self.assertIn(package, requirements)

    def test_frontend_package_scripts_exist(self):
        package = json.loads(
            (ROOT / "frontend" / "package.json").read_text(encoding="utf-8")
        )
        scripts = package.get("scripts", {})
        for name in ("dev", "build", "start", "lint"):
            with self.subTest(script=name):
                self.assertIn(name, scripts)

    def test_docker_compose_defines_postgres(self):
        compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
        self.assertIn("postgres:", compose)
        self.assertIn("5432:5432", compose)

    def test_health_route_and_ai_service_exist(self):
        main_py = (ROOT / "backend" / "app" / "main.py").read_text(
            encoding="utf-8"
        )
        ai_py = (ROOT / "backend" / "app" / "services" / "ai.py").read_text(
            encoding="utf-8"
        )
        self.assertIn('@app.get("/health")', main_py)
        self.assertIn("analyze_responses", ai_py)
        self.assertIn("response_mime_type", ai_py)


if __name__ == "__main__":
    unittest.main()
