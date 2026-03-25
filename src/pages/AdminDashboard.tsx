import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2, Eye, LogOut, Download, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";
import { CitizenModel } from "@/types";
import {
  subscribeCitizens,
  addCitizen,
  deleteCitizen,
  updateCitizen,
} from "@/lib/dataService";

const ADMIN_SECONDARY_PIN = "1234";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [secondaryPin, setSecondaryPin] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenModel | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [newlyCitizen, setNewlyCitizen] = useState<CitizenModel | null>(null);
  const [citizensList, setCitizensList] = useState<CitizenModel[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    nameHindi: "",
    aadhaar: "",
    voterId: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    abhaId: "",
    balance: 0,
  });

  // Check authentication on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    const admin2FA = localStorage.getItem("admin2FA");
    if (adminAuth !== "true") {
      navigate("/admin-login");
    } else {
      setIsAuthenticated(true);
      setIsPinVerified(admin2FA === "true");
    }

    // subscribe to firestore citizen list
    let isFirstLoad = true;
    const unsub = subscribeCitizens((list) => {
      console.log("Citizens data received:", list.length, "customers");
      setCitizensList(list);
      
      // Auto-seed on first load if collection is empty
      if (isFirstLoad && list.length === 0) {
        isFirstLoad = false;
        console.log("Collection empty on first load, auto-seeding...");
        import("@/data/sampleData").then(({ sampleCitizens }) => {
          console.log("Adding", sampleCitizens.length, "sample citizens...");
          Promise.all(sampleCitizens.map((c) => addCitizen(c)))
            .then(() => {
              console.log("Sample data seeded successfully");
              toast.success("Sample data loaded successfully!");
            })
            .catch((err) => {
              console.error("Error seeding data:", err);
              toast.error("Error loading sample data");
            });
        }).catch((err) => {
          console.error("Error importing sample data:", err);
        });
      } else if (isFirstLoad && list.length > 0) {
        isFirstLoad = false;
        console.log("Using existing data:", list.length, "customers found");
      }
    });
    return () => {
      unsub();
      isFirstLoad = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("admin2FA");
    localStorage.removeItem("adminLoginTime");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const verifySecondaryPin = () => {
    if (secondaryPin === ADMIN_SECONDARY_PIN) {
      localStorage.setItem("admin2FA", "true");
      setIsPinVerified(true);
      toast.success("Secondary PIN verified");
      return;
    }
    toast.error("Invalid secondary PIN");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "balance" ? parseFloat(value) || 0 : value,
    }));
  };

  const generateQRId = () => {
    const maxId = Math.max(...citizensList.map((c) => parseInt(c.qrId.split("_")[2])), 0);
    return `BQR_IND_${String(maxId + 1).padStart(3, "0")}`;
  };

  const handleLoadSampleData = async () => {
    try {
      const { sampleCitizens } = await import("@/data/sampleData");
      await Promise.all(sampleCitizens.map((c) => addCitizen(c)));
      toast.success(`${sampleCitizens.length} sample customers loaded successfully!`);
    } catch (err) {
      console.error("Error loading sample data:", err);
      toast.error("Failed to load sample data");
    }
  };

const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.aadhaar || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedCitizen) {
      // editing existing
      try {
        await updateCitizen(selectedCitizen.qrId, formData);
        toast.success(`${formData.name} updated successfully!`);
        setSelectedCitizen(null);
        setShowForm(false);
        setFormData({
          name: "",
          nameHindi: "",
          aadhaar: "",
          voterId: "",
          phone: "",
          village: "",
          district: "",
          state: "",
          abhaId: "",
          balance: 0,
        });
      } catch (err) {
        console.error(err);
        toast.error("Unable to update customer");
      }
      return;
    }

    // adding new citizen
    const newCitizen: CitizenModel = {
      qrId: generateQRId(),
      ...formData,
      bills: [],
      documents: [],
      healthRecords: [],
      prescriptions: [],
    };

    try {
      await addCitizen(newCitizen);
      setNewlyCitizen(newCitizen);
      setShowQRCode(true);
      setFormData({
      name: "",
      nameHindi: "",
      aadhaar: "",
      voterId: "",
      phone: "",
      village: "",
      district: "",
      state: "",
      abhaId: "",
      balance: 0,
    });
      setShowForm(false);
      toast.success(`${newCitizen.name} added successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Unable to add customer, try again");
    }
  };

  const handleDeleteCitizen = async (qrId: string) => {
    try {
      await deleteCitizen(qrId);
      toast.success("Customer deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete customer");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md p-6 border-2 border-secondary/20">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Operator Security Check</h2>
            <p className="text-sm text-slate-600 mb-4">Enter the 4-digit secondary Operator PIN to access Admin Dashboard.</p>
            <Input
              value={secondaryPin}
              onChange={(event) => setSecondaryPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Enter 4-digit PIN"
              inputMode="numeric"
              maxLength={4}
              className="mb-4"
            />
            <Button onClick={verifySecondaryPin} className="w-full bg-primary hover:bg-primary/80">Verify PIN</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage customer database</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <Button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Add Customer Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-2 border-secondary/30">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              {selectedCitizen ? "Edit Customer" : "Add New Customer"}
            </h2>
            <form onSubmit={handleAddCitizen} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="Name (Hindi)"
                  name="nameHindi"
                  value={formData.nameHindi}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Aadhaar Number *"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="Voter ID"
                  name="voterId"
                  value={formData.voterId}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Phone Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="ABHA ID"
                  name="abhaId"
                  value={formData.abhaId}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Village"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="District"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Account Balance"
                  name="balance"
                  type="number"
                  value={formData.balance}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/80">
                  {selectedCitizen ? "Save Changes" : "Add Customer & Generate QR"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-slate-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-blue-600">{citizensList.length}</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-slate-600 mb-1">Active Accounts</p>
            <p className="text-3xl font-bold text-green-600">{citizensList.length}</p>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-sm text-slate-600 mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-purple-600">₹{citizensList.reduce((sum, c) => sum + c.balance, 0)}</p>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <p className="text-sm text-slate-600 mb-1">QR Codes Generated</p>
            <p className="text-3xl font-bold text-orange-600">{citizensList.length}</p>
          </Card>
        </div>

        {/* Add Button */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80"
          >
            <Plus className="h-5 w-5" />
            Add New Customer
          </Button>
          {citizensList.length === 0 && (
            <Button
              onClick={handleLoadSampleData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Load Sample Data
            </Button>
          )}
        </div>

        {/* Customers List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">QR ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Balance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Bills</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {citizensList.map((citizen) => (
                  <tr key={citizen.qrId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900 font-bold">{citizen.qrId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{citizen.name}</p>
                        <p className="text-xs text-slate-500">{citizen.nameHindi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{citizen.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{citizen.village}, {citizen.state}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{citizen.balance}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        citizen.bills.length > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {citizen.bills.length} {citizen.bills.length === 1 ? "Bill" : "Bills"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCitizen(citizen);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCitizen(citizen);
                            setShowForm(true);
                            setFormData({
                              name: citizen.name,
                              nameHindi: citizen.nameHindi,
                              aadhaar: citizen.aadhaar,
                              voterId: citizen.voterId,
                              phone: citizen.phone,
                              village: citizen.village,
                              district: citizen.district,
                              state: citizen.state,
                              abhaId: citizen.abhaId,
                              balance: citizen.balance,
                            });
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${citizen.name}?`)) {
                              handleDeleteCitizen(citizen.qrId);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Details Modal */}
        {selectedCitizen && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCitizen.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">QR ID</p>
                    <p className="font-mono font-bold text-lg">{selectedCitizen.qrId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Aadhaar</p>
                    <p className="font-mono">{selectedCitizen.aadhaar}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-mono">{selectedCitizen.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Account Balance</p>
                    <p className="font-bold text-green-600">₹{selectedCitizen.balance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p>{selectedCitizen.village}, {selectedCitizen.district}, {selectedCitizen.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">ABHA ID</p>
                    <p className="font-mono">{selectedCitizen.abhaId}</p>
                  </div>
                </div>

                {/* Bills */}
                {selectedCitizen.bills.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Pending Bills</h3>
                    <div className="space-y-2">
                      {selectedCitizen.bills.map((bill, idx) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-medium">{bill.label}</p>
                          <p className="text-sm text-slate-600">₹{bill.amount} - Due: {bill.dueDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedCitizen.documents.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {selectedCitizen.documents.map((doc, idx) => (
                        <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
                          {doc.name} ({doc.type}) - Issued: {doc.issued}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Records */}
                {selectedCitizen.healthRecords.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Health Records</h3>
                    <div className="space-y-2">
                      {selectedCitizen.healthRecords.map((record, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 rounded text-sm">
                          {record.condition} - {record.date} by {record.doctor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* QR Code Modal for Newly Created Citizen */}
        {newlyCitizen && (
          <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">✅ Citizen Registered Successfully!</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{newlyCitizen.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{newlyCitizen.nameHindi}</p>
                  <p className="text-xs text-slate-500 mt-2 font-mono">ID: {newlyCitizen.qrId}</p>
                </div>

                <div className="flex justify-center">
                  <QRCodeDisplay qrId={newlyCitizen.qrId} name={newlyCitizen.name} />
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>Instructions:</strong>
                  </p>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1">
                    <li>• Print or save this QR code</li>
                    <li>• Give to citizen or display at help desk</li>
                    <li>• Citizens can scan to access dashboard</li>
                    <li>• QR ID: <span className="font-mono font-bold">{newlyCitizen.qrId}</span></li>
                  </ul>
                </div>

                <Button
                  onClick={() => setShowQRCode(false)}
                  className="w-full bg-primary hover:bg-primary/80"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
