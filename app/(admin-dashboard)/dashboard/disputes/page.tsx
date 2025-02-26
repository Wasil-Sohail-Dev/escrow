
const DisputesPage = () => {
  return (
      <div className="space-y-6">
        {/* Disputes Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading2-bold text-main-heading">Disputes</h1>
            <p className="text-base-regular text-dark-2">Manage and resolve project disputes</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-base-medium">
            Contact Support
          </button>
        </div>

        {/* Dispute Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-sidebar-border">
            <h3 className="text-small-medium text-dark-2">Active Disputes</h3>
            <p className="text-heading3-bold text-main-heading">2</p>
            <p className="text-small-regular text-error-text">Requires attention</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-sidebar-border">
            <h3 className="text-small-medium text-dark-2">Resolved</h3>
            <p className="text-heading3-bold text-main-heading">15</p>
            <p className="text-small-regular text-success-text">This year</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-sidebar-border">
            <h3 className="text-small-medium text-dark-2">Amount in Dispute</h3>
            <p className="text-heading3-bold text-main-heading">$5.2K</p>
            <p className="text-small-regular text-dark-2">Across 2 projects</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-sidebar-border">
            <h3 className="text-small-medium text-dark-2">Resolution Rate</h3>
            <p className="text-heading3-bold text-main-heading">92%</p>
            <p className="text-small-regular text-dark-2">Last 30 days</p>
          </div>
        </div>

        {/* Active Disputes */}
        <div className="bg-white rounded-lg border border-sidebar-border">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-heading3-bold text-main-heading">Active Disputes</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Dispute Item */}
            <div className="border border-sidebar-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base-semibold text-paragraph">Website Redesign - Milestone 3</h3>
                  <p className="text-small-regular text-dark-2">Dispute opened on Jan 25, 2024</p>
                </div>
                <span className="px-3 py-1 text-small-medium rounded-full bg-error-bg text-error-text">
                  Under Review
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-small-medium text-dark-2">Client</p>
                  <p className="text-base-regular text-paragraph">John Doe</p>
                </div>
                <div>
                  <p className="text-small-medium text-dark-2">Amount in Dispute</p>
                  <p className="text-base-regular text-paragraph">$3,000</p>
                </div>
                <div>
                  <p className="text-small-medium text-dark-2">Time Remaining</p>
                  <p className="text-base-regular text-error-text">2 days to respond</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-small-medium text-dark-2">Dispute Reason</p>
                <p className="text-base-regular text-paragraph">
                  Deliverables do not match the agreed specifications. Client requests revision of the UI components.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 border border-primary text-primary rounded-lg text-base-medium">
                  View Details
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-base-medium">
                  Respond to Dispute
                </button>
              </div>
            </div>

            {/* Second Dispute Item */}
            <div className="border border-sidebar-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base-semibold text-paragraph">Mobile App Development - API Integration</h3>
                  <p className="text-small-regular text-dark-2">Dispute opened on Jan 28, 2024</p>
                </div>
                <span className="px-3 py-1 text-small-medium rounded-full bg-primary-100 text-primary">
                  In Mediation
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-small-medium text-dark-2">Client</p>
                  <p className="text-base-regular text-paragraph">Jane Smith</p>
                </div>
                <div>
                  <p className="text-small-medium text-dark-2">Amount in Dispute</p>
                  <p className="text-base-regular text-paragraph">$2,200</p>
                </div>
                <div>
                  <p className="text-small-medium text-dark-2">Status</p>
                  <p className="text-base-regular text-paragraph">Mediator Assigned</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-small-medium text-dark-2">Dispute Reason</p>
                <p className="text-base-regular text-paragraph">
                  Performance issues with the API integration. Client reports slower response times than specified.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 border border-primary text-primary rounded-lg text-base-medium">
                  View Details
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-base-medium">
                  Contact Mediator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dispute History */}
        <div className="bg-white rounded-lg border border-sidebar-border">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-heading3-bold text-main-heading">Resolution History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sidebar-border">
                  <th className="text-left py-4 px-6 text-base-medium text-dark-2">Project</th>
                  <th className="text-left py-4 px-6 text-base-medium text-dark-2">Client</th>
                  <th className="text-left py-4 px-6 text-base-medium text-dark-2">Amount</th>
                  <th className="text-left py-4 px-6 text-base-medium text-dark-2">Resolution</th>
                  <th className="text-left py-4 px-6 text-base-medium text-dark-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-sidebar-border">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-base-semibold text-paragraph">E-commerce Platform</p>
                      <p className="text-small-regular text-dark-2">Milestone 4</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-base-regular text-paragraph">Alex Johnson</td>
                  <td className="py-4 px-6 text-base-semibold text-paragraph">$4,500</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 text-small-medium rounded-full bg-success-bg text-success-text">
                      Resolved
                    </span>
                  </td>
                  <td className="py-4 px-6 text-base-regular text-dark-2">Jan 10, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DisputesPage; 