import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  projectService,
  DocumentType,
  SectionCreate,
} from "../services/projects";
import { aiService } from "../services/ai";

const formatError = (err: any, fallback: string): string => {
  if (typeof err?.response?.data?.detail === "string") {
    return err.response.data.detail;
  }
  if (Array.isArray(err?.response?.data?.detail)) {
    return err.response.data.detail
      .map((e: any) => e.msg || JSON.stringify(e))
      .join(", ");
  }
  return err.message || err.toString() || fallback;
};

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("docx");
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState<SectionCreate[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      setSections([
        ...sections,
        { title: newSectionTitle.trim(), order_index: sections.length },
      ]);
      setNewSectionTitle("");
    }
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections
      .filter((_, i) => i !== index)
      .map((s, i) => ({
        ...s,
        order_index: i,
      }));
    setSections(newSections);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];
    newSections.forEach((s, i) => {
      s.order_index = i;
    });
    setSections(newSections);
  };

  const handleAiSuggest = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }

    setAiSuggesting(true);
    setError("");

    try {
      const response = await aiService.suggestOutline({
        topic: topic.trim(),
        doc_type: docType,
        num_items: docType === "docx" ? 6 : 8,
      });

      setSections(
        response.items.map((title, index) => ({
          title,
          order_index: index,
        }))
      );
    } catch (err: any) {
      setError(formatError(err, "Failed to generate suggestions"));
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !topic.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (docType === "docx" && sections.length === 0) {
      setError("Please add at least one section for Word documents");
      return;
    }

    if (docType === "pptx" && sections.length === 0) {
      setError("Please add at least one slide for PowerPoint presentations");
      return;
    }

    setLoading(true);

    try {
      const project = await projectService.createProject({
        title: title.trim(),
        doc_type: docType,
        topic: topic.trim(),
      });

      // Create sections/slides
      for (const section of sections) {
        await projectService.createSection(project.id, section);
      }

      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      setError(formatError(err, "Failed to create project"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Premium Navbar */}
      <nav className="nav-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-silver hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-display-2 font-display text-white mb-2 tracking-tight">
              Create New Project
            </h1>
            <p className="text-silver text-sm">
              Define your document structure and start generating content
            </p>
          </div>

          {/* Glass Card Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card p-8 space-y-8 animate-fadeInUp"
          >
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-silver mb-2"
              >
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-premium"
                required
              />
            </div>

            <div>
              <label
                htmlFor="docType"
                className="block text-sm font-medium text-silver mb-2"
              >
                Document Type *
              </label>
              <select
                id="docType"
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value as DocumentType);
                  setSections([]);
                }}
                className="input-premium"
                required
              >
                <option value="docx" className="bg-black text-white">
                  Word Document (.docx)
                </option>
                <option value="pptx" className="bg-black text-white">
                  PowerPoint Presentation (.pptx)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-silver mb-2"
              >
                Main Topic *
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Market analysis of the EV industry in 2025"
                className="input-premium"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-silver">
                  {docType === "docx" ? "Section Headers" : "Slide Titles"} *
                </label>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiSuggesting || !topic.trim()}
                  className="text-sm text-white hover:text-soft-silver disabled:text-silver/50 transition-colors underline underline-offset-2"
                >
                  {aiSuggesting ? "Generating..." : "AI-Suggest Outline"}
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 glass-card p-3"
                  >
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[index].title = e.target.value;
                        setSections(newSections);
                      }}
                      className="flex-1 input-premium text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleMoveSection(index, "up")}
                      disabled={index === 0}
                      className="px-3 py-2 text-silver hover:text-white disabled:text-silver/30 transition-colors border border-white/10 hover:border-white/20 rounded"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className="px-3 py-2 text-silver hover:text-white disabled:text-silver/30 transition-colors border border-white/10 hover:border-white/20 rounded"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors border border-red-500/30 hover:border-red-500/50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSection();
                    }
                  }}
                  placeholder={`Add ${
                    docType === "docx" ? "section" : "slide"
                  } title...`}
                  className="flex-1 input-premium"
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="btn-premium"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-premium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
