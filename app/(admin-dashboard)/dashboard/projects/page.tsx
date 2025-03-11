"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Pagination from "@/components/dashboard/Pagination";
import { formatDate } from "@/lib/helpers/fromatDate";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import Link from "next/link";

interface Project {
  _id: string;
  contractId: string;
  title: string;
  client: {
    name: string;
    email: string;
    since: string;
  };
  budget: number;
  releasedAmount: number;
  progress: number;
  nextMilestone: {
    title: string;
    dueDate: string;
  } | null;
  status: string;
}

interface Stats {
  active: number;
  completed: number;
  totalValue: number;
  successRate: number;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [itemsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: activeTab,
        search: debouncedSearchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/get-projects?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, activeTab, debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "active" | "completed") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Projects Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">
            Projects
          </h1>
          <p className="text-base-regular text-dark-2">
            Manage your active and completed projects
          </p>
        </div>
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs dark:bg-dark-input-bg dark:text-dark-text"
        />
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Active Projects
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.active || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Completed
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.completed || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Total Value
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.totalValue.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Success Rate
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.successRate || 0}%
          </p>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        {/* Tabs */}
        <div className="border-b border-sidebar-border dark:border-dark-border">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange("active")}
              className={`py-4 text-base-medium ${
                activeTab === "active"
                  ? "text-primary border-b-2 border-primary"
                  : "text-dark-2 dark:text-dark-text"
              }`}
            >
              Active Projects
            </button>
            <button
              onClick={() => handleTabChange("completed")}
              className={`py-4 text-base-medium ${
                activeTab === "completed"
                  ? "text-primary border-b-2 border-primary"
                  : "text-dark-2 dark:text-dark-text"
              }`}
            >
              Completed Projects
            </button>
          </div>
        </div>

        {/* Filter Section */}

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border dark:border-dark-border">
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Project Details
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Client
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Value
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Progress
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Next Milestone
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <Loader
                      size="md"
                      text="Loading projects..."
                      fullHeight={false}
                    />
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-dark-2 dark:text-dark-text/60"
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-sidebar-border dark:border-dark-border"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-base-semibold text-paragraph dark:text-dark-text">
                          {project.title}
                        </p>
                        <p className="text-small-regular text-dark-2">
                          {project.contractId}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-base-regular text-paragraph dark:text-dark-text">
                          {project.client.name}
                        </p>
                        <p className="text-small-regular text-dark-2">
                          Client since {formatDate(project.client.since)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-base-semibold text-paragraph dark:text-dark-text">
                        ${project.budget.toLocaleString()}
                      </p>
                      <p className="text-small-regular text-success-text">
                        ${project.releasedAmount.toLocaleString()} released
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-small-regular text-dark-2 mt-1">
                        {project.progress}% Complete
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {project.nextMilestone ? (
                        <>
                          <p className="text-base-regular text-paragraph dark:text-dark-text">
                            {project.nextMilestone.title.length > 20
                              ? project.nextMilestone.title.slice(0, 20) + "..."
                              : project.nextMilestone.title}
                          </p>
                          <p className="text-small-regular text-dark-2">
                            Due {formatDate(project.nextMilestone.dueDate)}
                          </p>
                        </>
                      ) : (
                        <p className="text-small-regular text-dark-2">
                          No pending milestones
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/dashboard/contract-details/${project.contractId}`}
                        className="text-small-medium text-primary hover:text-primary-500"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
