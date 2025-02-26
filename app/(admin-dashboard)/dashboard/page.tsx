const DashboardPage = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium sm:text-base-medium text-secondary-heading dark:text-dark-text mb-2">
            Total Revenue
          </h3>
          <p className="text-heading3-bold lg:text-heading2-bold text-main-heading dark:text-dark-text">
            $1.2M
          </p>
          <p className="text-small-regular text-success-text">
            +15% from last month
          </p>
        </div>
        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium sm:text-base-medium text-secondary-heading dark:text-dark-text mb-2">
            Active Projects
          </h3>
          <p className="text-heading3-bold lg:text-heading2-bold text-main-heading dark:text-dark-text">
            145
          </p>
          <p className="text-small-regular text-dark-2">Across all vendors</p>
        </div>
        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium sm:text-base-medium text-secondary-heading dark:text-dark-text mb-2">
            Total Users
          </h3>
          <p className="text-heading3-bold lg:text-heading2-bold text-main-heading dark:text-dark-text">
            380
          </p>
          <p className="text-small-regular text-dark-2">
            256 Clients, 124 Vendors
          </p>
        </div>
        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium sm:text-base-medium text-secondary-heading dark:text-dark-text mb-2">
            Platform Health
          </h3>
          <p className="text-heading3-bold lg:text-heading2-bold text-main-heading dark:text-dark-text">
            98%
          </p>
          <p className="text-small-regular text-success-text">
            All systems operational
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-heading3-bold text-main-heading dark:text-dark-text mb-4">
            Pending Actions
          </h2>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-white-2 dark:bg-dark-input-bg rounded-lg">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-2 h-2 rounded-full bg-error-accent"></div>
                <div>
                  <p className="text-base-medium text-paragraph dark:text-dark-text">
                    Vendor Verification Required
                  </p>
                  <p className="text-small-regular text-dark-2">
                    15 new vendors awaiting verification
                  </p>
                </div>
              </div>
              <button className="text-small-medium text-primary hover:text-primary-500 w-full sm:w-auto">
                Review
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-white-2 dark:bg-dark-input-bg rounded-lg">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-2 h-2 rounded-full bg-error-accent"></div>
                <div>
                  <p className="text-base-medium text-paragraph dark:text-dark-text">
                    Disputes Requiring Attention
                  </p>
                  <p className="text-small-regular text-dark-2">
                    8 disputes need mediation
                  </p>
                </div>
              </div>
              <button className="text-small-medium text-primary hover:text-primary-500 w-full sm:w-auto">
                Resolve
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-heading3-bold text-main-heading dark:text-dark-text mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Payment Processing
                </p>
                <span className="text-small-regular text-success-text">
                  Operational
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Escrow Services
                </p>
                <span className="text-small-regular text-success-text">
                  Operational
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  User Authentication
                </p>
                <span className="text-small-regular text-success-text">
                  95% Uptime
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-bg p-4 lg:p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
        <h2 className="text-heading3-bold text-main-heading dark:text-dark-text mb-4 lg:mb-6">
          System Activity
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-2 h-2 rounded-full bg-success-accent mt-2 sm:mt-0"></div>
              <div>
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  New Vendor Registration
                </p>
                <p className="text-small-regular text-dark-2">
                  Tech Solutions Inc. completed registration
                </p>
              </div>
            </div>
            <span className="text-small-regular text-dark-2">
              2 minutes ago
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-2 h-2 rounded-full bg-error-accent mt-2 sm:mt-0"></div>
              <div>
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Dispute Opened
                </p>
                <p className="text-small-regular text-dark-2">
                  Project #ESC-3345 requires mediation
                </p>
              </div>
            </div>
            <span className="text-small-regular text-dark-2">
              15 minutes ago
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 sm:mt-0"></div>
              <div>
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Large Transaction Processed
                </p>
                <p className="text-small-regular text-dark-2">
                  $50,000 released to vendor #V-789
                </p>
              </div>
            </div>
            <span className="text-small-regular text-dark-2">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
