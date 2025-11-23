import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { projectService, Project } from "../services/projects";

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

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.listProjects();
      setProjects(data);
    } catch (err: any) {
      setError(formatError(err, "Failed to load projects"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(formatError(err, "Failed to delete project"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Premium Navbar */}
      <nav className="nav-premium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Document Authoring Platform
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-silver text-sm">{user?.email}</span>
              <button
                onClick={logout}
                className="text-silver hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-display-2 font-display text-white mb-2 tracking-tight">
                My Projects
              </h2>
              <p className="text-silver text-sm">
                Manage and create your documents
              </p>
            </div>
            <Link to="/projects/new" className="btn-premium-black">
              Create New Project
            </Link>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="text-lg text-silver animate-slowPulse">
                Loading projects...
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass-card p-12 max-w-md mx-auto">
                <p className="text-silver mb-6 text-lg">
                  No projects yet. Create your first project!
                </p>
                <Link
                  to="/projects/new"
                  className="btn-premium-black inline-block"
                >
                  Create New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="glass-card-hover p-6 cursor-pointer animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white pr-4">
                      {project.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-silver text-sm mb-4 line-clamp-2">
                    {project.topic}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span
                      className={`badge-premium ${
                        project.doc_type === "docx"
                          ? "text-silver border-silver/30"
                          : "text-white border-white/30"
                      }`}
                    >
                      {project.doc_type.toUpperCase()}
                    </span>
                    <span className="text-xs text-silver">
                      {project.sections.length}{" "}
                      {project.doc_type === "docx" ? "sections" : "slides"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
