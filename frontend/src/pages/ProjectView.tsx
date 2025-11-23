import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, Project, Section } from "../services/projects";
import { generationService } from "../services/generation";
import { feedbackService } from "../services/feedback";
import { exportService } from "../services/export";

// Helper to safely extract a readable error message from API responses
const formatError = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => {
        if (typeof d === "string") return d;
        if (d && typeof d === "object") {
          if (typeof d.msg === "string") return d.msg;
          if (typeof d.message === "string") return d.message;
          return JSON.stringify(d);
        }
        return String(d);
      })
      .filter(Boolean);
    if (msgs.length > 0) {
      return msgs.join(", ");
    }
  } else if (detail && typeof detail === "object") {
    // Single validation error object
    if (typeof (detail as any).msg === "string") return (detail as any).msg;
    if (typeof (detail as any).message === "string")
      return (detail as any).message;
    return JSON.stringify(detail);
  } else if (typeof detail === "string") {
    return detail;
  }

  const msg = err?.message;
  if (typeof msg === "string" && msg.trim().length > 0) {
    return msg;
  }

  return fallback;
};

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [refining, setRefining] = useState<string | null>(null);
  const [refinementPrompts, setRefinementPrompts] = useState<
    Record<string, string>
  >({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState<
    Record<string, boolean>
  >({});
  const [feedbackStatus, setFeedbackStatus] = useState<
    Record<string, { liked: boolean | null; message: string }>
  >({});

  const loadProject = async () => {
    try {
      const data = await projectService.getProject(id!);
      setProject(data);
    } catch (err: any) {
      setError(formatError(err, "Failed to load project"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerate = async (sectionId: string) => {
    if (!project) return;

    setGenerating(sectionId);
    setError("");

    try {
      await generationService.generateSection({
        project_id: project.id,
        section_id: sectionId,
      });
      await loadProject();
    } catch (err: any) {
      setError(formatError(err, "Failed to generate content"));
    } finally {
      setGenerating(null);
    }
  };

  const handleRefine = async (sectionId: string) => {
    if (!project) return;

    const prompt = refinementPrompts[sectionId];
    if (!prompt?.trim()) {
      setError("Please enter a refinement prompt");
      return;
    }

    setRefining(sectionId);
    setError("");

    try {
      await generationService.refineSection({
        project_id: project.id,
        section_id: sectionId,
        prompt: prompt.trim(),
      });
      setRefinementPrompts({ ...refinementPrompts, [sectionId]: "" });
      await loadProject();
    } catch (err: any) {
      setError(formatError(err, "Failed to refine content"));
    } finally {
      setRefining(null);
    }
  };

  const handleFeedback = async (sectionId: string, liked: boolean) => {
    if (!project) return;

    setSubmittingFeedback({ ...submittingFeedback, [sectionId]: true });
    setFeedbackStatus({
      ...feedbackStatus,
      [sectionId]: { liked: null, message: "" },
    });

    try {
      await feedbackService.submitFeedback({
        project_id: project.id,
        section_id: sectionId,
        liked,
      });
      // Show success message
      setFeedbackStatus({
        ...feedbackStatus,
        [sectionId]: {
          liked,
          message: liked
            ? "👍 Thank you for your feedback!"
            : "👎 Thanks, we'll improve this!",
        },
      });
      // Clear message after 3 seconds
      setTimeout(() => {
        setFeedbackStatus((prev) => {
          const updated = { ...prev };
          if (updated[sectionId]) {
            updated[sectionId] = { ...updated[sectionId], message: "" };
          }
          return updated;
        });
      }, 3000);
    } catch (err: any) {
      const errorMessage = formatError(
        err,
        "Failed to submit feedback. Please try again."
      );
      setError(errorMessage);
      setFeedbackStatus({
        ...feedbackStatus,
        [sectionId]: { liked: null, message: errorMessage },
      });
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmittingFeedback({ ...submittingFeedback, [sectionId]: false });
    }
  };

  const handleComment = async (sectionId: string) => {
    if (!project) return;

    const comment = comments[sectionId];
    if (!comment?.trim()) return;

    try {
      await feedbackService.addComment({
        project_id: project.id,
        section_id: sectionId,
        comment_text: comment.trim(),
      });
      setComments({ ...comments, [sectionId]: "" });
      await loadProject();
    } catch (err: any) {
      setError(formatError(err, "Failed to add comment"));
    }
  };

  const handleExport = async (type: "docx" | "pptx") => {
    if (!project) return;

    setExporting(true);
    setError("");

    try {
      await exportService.exportProject(project.id, type);
    } catch (err: any) {
      setError(formatError(err, "Failed to export document"));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-lg text-silver animate-slowPulse">
          Loading project...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-lg text-red-400">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Premium Navbar */}
      <nav className="nav-premium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-silver hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-white">{project.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleExport(project.doc_type)}
                disabled={exporting}
                className="btn-premium-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? "Exporting..." : `Export as .${project.doc_type}`}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {/* Project Header Card */}
          <div className="glass-card p-8 mb-8 animate-fadeInUp">
            <h2 className="text-display-3 font-display text-white mb-4 tracking-tight">
              {project.title}
            </h2>
            <p className="text-silver text-lg mb-4">Topic: {project.topic}</p>
            <div className="flex items-center space-x-4">
              <span
                className={`badge-premium ${
                  project.doc_type === "docx"
                    ? "text-silver border-silver/30"
                    : "text-white border-white/30"
                }`}
              >
                {project.doc_type.toUpperCase()}
              </span>
              <span className="text-sm text-silver">
                {project.sections.length}{" "}
                {project.doc_type === "docx" ? "sections" : "slides"}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {project.sections.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-silver">
                No sections yet. Configure your project first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {project.sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  project={project}
                  generating={generating === section.id}
                  refining={refining === section.id}
                  refinementPrompt={refinementPrompts[section.id] || ""}
                  onRefinementPromptChange={(value) =>
                    setRefinementPrompts({
                      ...refinementPrompts,
                      [section.id]: value,
                    })
                  }
                  comment={comments[section.id] || ""}
                  onCommentChange={(value) =>
                    setComments({ ...comments, [section.id]: value })
                  }
                  onGenerate={() => handleGenerate(section.id)}
                  onRefine={() => handleRefine(section.id)}
                  onFeedback={(liked) => handleFeedback(section.id, liked)}
                  onComment={() => handleComment(section.id)}
                  submittingFeedback={submittingFeedback[section.id] || false}
                  feedbackStatus={feedbackStatus[section.id]}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface SectionCardProps {
  section: Section;
  project: Project;
  generating: boolean;
  refining: boolean;
  refinementPrompt: string;
  onRefinementPromptChange: (value: string) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  onGenerate: () => void;
  onRefine: () => void;
  onFeedback: (liked: boolean) => void;
  onComment: () => void;
  submittingFeedback?: boolean;
  feedbackStatus?: { liked: boolean | null; message: string };
  index?: number;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  project,
  generating,
  refining,
  refinementPrompt,
  onRefinementPromptChange,
  comment,
  onCommentChange,
  onGenerate,
  onRefine,
  onFeedback,
  onComment,
  submittingFeedback = false,
  feedbackStatus,
  index = 0,
}) => {
  return (
    <div
      className="section-card animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <h3 className="text-2xl font-bold text-white mb-6">{section.title}</h3>

      <div className="mb-6">
        {section.content ? (
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/10 whitespace-pre-wrap text-soft-silver">
            {section.content}
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/5 text-silver italic">
            No content generated yet
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Generate Button */}
        <div>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="btn-premium-black w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating..." : "Generate Content"}
          </button>
        </div>

        {/* Refinement Section */}
        {section.content && (
          <div className="border-t border-white/5 pt-6">
            <label className="block text-sm font-medium text-silver mb-3">
              AI Refinement Prompt
            </label>
            <textarea
              value={refinementPrompt}
              onChange={(e) => onRefinementPromptChange(e.target.value)}
              placeholder="e.g., Make this more formal, Convert to bullet points, Shorten to 100 words"
              className="input-premium mb-3"
              rows={3}
            />
            <button
              onClick={onRefine}
              disabled={refining || !refinementPrompt.trim()}
              className="btn-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refining ? "Refining..." : "Apply Refinement"}
            </button>
          </div>
        )}

        {/* Feedback Section */}
        {section.content && (
          <div className="border-t border-white/5 pt-6">
            <label className="block text-sm font-medium text-silver mb-3">
              Feedback
            </label>
            {feedbackStatus?.message && (
              <div
                className={`mb-3 px-4 py-2 rounded-lg text-sm backdrop-blur-sm ${
                  feedbackStatus.liked === null
                    ? "bg-red-900/30 text-red-200 border border-red-500/30"
                    : "bg-green-900/30 text-green-200 border border-green-500/30"
                }`}
              >
                {feedbackStatus.message}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={() => onFeedback(true)}
                disabled={submittingFeedback}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  submittingFeedback
                    ? "bg-charcoal text-silver cursor-not-allowed border border-white/5"
                    : feedbackStatus?.liked === true
                    ? "bg-white text-black border-2 border-white shadow-glow-hover"
                    : "btn-premium"
                }`}
              >
                {submittingFeedback ? "Submitting..." : "👍 Like"}
              </button>
              <button
                onClick={() => onFeedback(false)}
                disabled={submittingFeedback}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  submittingFeedback
                    ? "bg-charcoal text-silver cursor-not-allowed border border-white/5"
                    : feedbackStatus?.liked === false
                    ? "bg-white text-black border-2 border-white shadow-glow-hover"
                    : "btn-premium"
                }`}
              >
                {submittingFeedback ? "Submitting..." : "👎 Dislike"}
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {section.content && (
          <div className="border-t border-white/5 pt-6">
            <label className="block text-sm font-medium text-silver mb-3">
              Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add your notes here..."
              className="input-premium mb-3"
              rows={3}
            />
            <button
              onClick={onComment}
              disabled={!comment.trim()}
              className="btn-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
