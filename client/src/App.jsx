import { useEffect, useState } from "react";

function App() {
  const API_URL = "http://localhost:5000/api";

  const [screen, setScreen] = useState("landing");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [employeeForm, setEmployeeForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    joiningDate: "",
    status: "Active",
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage("");
        setMessageType("");
        setScreen("dashboard");
        fetchEmployees();
      }
    } catch {
      // Backend may not be running.
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setEmployees(data.employees);
    } catch {
      setMessage("Unable to load employees");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(data.message || "Login failed");
        return;
      }

      setUser(data.user);
      setEmail("");
      setPassword("");
      setMessage("");
      setMessageType("");
      setScreen("dashboard");

      fetchEmployees();
    } catch {
      setMessageType("error");
      setMessage("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setRegisterLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(data.message || "Registration failed");
        return;
      }

      const registeredEmail = registerEmail;

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");

      setEmail(registeredEmail);
      setPassword("");

      setMessage(
        "✓ Registration successful. Your account is ready — sign in now.",
      );
      setMessageType("success");

      setTimeout(() => {
        setScreen("login");
      }, 1200);
    } catch {
      setMessageType("error");
      setMessage("Unable to connect to the server");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target;

    setEmployeeForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    setMessage("");
    setEmployeeLoading(true);

    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...employeeForm,
          salary: Number(employeeForm.salary),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(data.message || "Failed to create employee");
        return;
      }

      setEmployeeForm({
        employeeId: "",
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        salary: "",
        joiningDate: "",
        status: "Active",
      });

      setShowAddEmployee(false);
      setMessageType("success");
      setMessage("Employee created successfully.");
      await fetchEmployees();
    } catch {
      setMessageType("error");
      setMessage("Unable to connect to the server");
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleViewEmployee = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load employee");
        return;
      }

      setSelectedEmployee(data.employee);
      setEditingEmployee(null);
      setMessage("");
    } catch {
      setMessage("Unable to connect to the server");
    }
  };

  const handleDeleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete employee");
        return;
      }

      setSelectedEmployee(null);
      setEditingEmployee(null);
      setMessage("");

      await fetchEmployees();
    } catch {
      setMessage("Unable to connect to the server");
    }
  };

  const handleEditEmployee = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${editingEmployee._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            employeeId: editingEmployee.employeeId,
            name: editingEmployee.name,
            email: editingEmployee.email,
            phone: editingEmployee.phone,
            position: editingEmployee.position,
            department: editingEmployee.department,
            salary: Number(editingEmployee.salary),
            joiningDate: editingEmployee.joiningDate,
            status: editingEmployee.status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to update employee");
        return;
      }

      setEditingEmployee(null);
      setSelectedEmployee(null);
      setMessage("");

      await fetchEmployees();
    } catch {
      setMessage("Unable to connect to the server");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setEmployees([]);
      setScreen("landing");
    }
  };

  if (screen === "landing") {
    return (
      <main className="app-shell">
        <section className="landing">
          <div className="brand-mark">EMP.</div>

          <div className="landing-content">
            <p className="eyebrow">EMPLOYEE OPERATIONS</p>

            <h1>
              People,
              <br />
              <span>organized.</span>
            </h1>

            <p className="intro">
              A focused workspace for managing people, roles, and organizational
              data.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("login")}
            >
              Enter workspace
              <span>→</span>
            </button>
          </div>

          <div className="landing-footer">
            <span>EMPLOYEE MANAGEMENT SYSTEM</span>
            <span>v1.0</span>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <main className="app-shell">
        <section className="login-page">
          <div className="login-header">
            <button
              className="brand-mark brand-button"
              onClick={() => {
                setMessage("");
                setScreen("landing");
              }}
            >
              EMP.
            </button>

            <span className="status-indicator">
              <span></span>
              SECURE ACCESS
            </span>
          </div>

          <div className="login-content">
            <div className="login-intro">
              <p className="eyebrow">01 / AUTHENTICATION</p>

              <h2>
                Welcome
                <br />
                <span>back.</span>
              </h2>

              <p>Sign in to access your employee workspace.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {message && (
                <p className={`form-message ${messageType}`}>{message}</p>
              )}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Signing in..." : "Continue"}
                <span>→</span>
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMessage("");
                  setScreen("register");
                }}
              >
                Create a new account
              </button>
            </form>
          </div>

          <div className="login-footer">
            <span>EMPLOYEE MANAGEMENT SYSTEM</span>
            <span>SESSION / SECURE</span>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "register") {
    return (
      <main className="app-shell">
        <section className="login-page">
          <div className="login-header">
            <button
              className="brand-mark brand-button"
              onClick={() => {
                setMessage("");
                setScreen("landing");
              }}
            >
              EMP.
            </button>

            <span className="status-indicator">
              <span></span>
              SECURE ACCESS
            </span>
          </div>

          <div className="login-content">
            <div className="login-intro">
              <p className="eyebrow">01 / REGISTRATION</p>

              <h2>
                Create
                <br />
                <span>account.</span>
              </h2>

              <p>Create an account to access your employee workspace.</p>
            </div>

            <form className="login-form" onSubmit={handleRegister}>
              <label>
                Full name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  minLength="6"
                  required
                />
              </label>

              {message && (
                <p
                  className={`form-message registration-message ${messageType}`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={registerLoading}
              >
                {registerLoading ? "Creating..." : "Create account"}
                <span>→</span>
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMessage("");
                  setScreen("login");
                }}
              >
                Already have an account? Sign in
              </button>
            </form>
          </div>

          <div className="login-footer">
            <span>EMPLOYEE MANAGEMENT SYSTEM</span>
            <span>ACCOUNT / NEW</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="dashboard-header">
          <div className="brand-mark">EMP.</div>

          <div className="dashboard-user">
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>

            <button onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">02 / OVERVIEW</p>

              <h2>
                People
                <br />
                <span>directory.</span>
              </h2>
            </div>

            <button
              className="add-button"
              onClick={() => {
                setMessage("");
                setSelectedEmployee(null);
                setEditingEmployee(null);
                setShowAddEmployee(true);
              }}
            >
              <span>+</span>
              Add employee
            </button>
          </div>

          <div className="employee-meta">
            <span>{employees.length} employees</span>
            <span>LIVE DATABASE</span>
          </div>

          {showAddEmployee && (
            <div className="employee-form-panel">
              <div className="form-panel-header">
                <div>
                  <p className="eyebrow">03 / NEW RECORD</p>
                  <h3>Add employee.</h3>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={() => {
                    setShowAddEmployee(false);
                    setMessage("");
                  }}
                >
                  ×
                </button>
              </div>

              <form className="employee-form" onSubmit={handleAddEmployee}>
                <label>
                  Employee ID
                  <input
                    name="employeeId"
                    value={employeeForm.employeeId}
                    onChange={handleEmployeeChange}
                    placeholder="EMP002"
                    required
                  />
                </label>

                <label>
                  Full name
                  <input
                    name="name"
                    value={employeeForm.name}
                    onChange={handleEmployeeChange}
                    placeholder="Employee name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={employeeForm.email}
                    onChange={handleEmployeeChange}
                    placeholder="employee@example.com"
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    value={employeeForm.phone}
                    onChange={handleEmployeeChange}
                    placeholder="9876543210"
                    required
                  />
                </label>

                <label>
                  Position
                  <input
                    name="position"
                    value={employeeForm.position}
                    onChange={handleEmployeeChange}
                    placeholder="Software Developer"
                    required
                  />
                </label>

                <label>
                  Department
                  <input
                    name="department"
                    value={employeeForm.department}
                    onChange={handleEmployeeChange}
                    placeholder="Engineering"
                    required
                  />
                </label>

                <label>
                  Salary
                  <input
                    type="number"
                    name="salary"
                    value={employeeForm.salary}
                    onChange={handleEmployeeChange}
                    placeholder="50000"
                    min="0"
                    required
                  />
                </label>

                <label>
                  Joining date
                  <input
                    type="date"
                    name="joiningDate"
                    value={employeeForm.joiningDate}
                    onChange={handleEmployeeChange}
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={employeeForm.status}
                    onChange={handleEmployeeChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                {message && (
                  <p className={`form-message ${messageType}`}>{message}</p>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowAddEmployee(false);
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    disabled={employeeLoading}
                  >
                    {employeeLoading ? "Saving..." : "Create employee"}
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="employee-table">
            <div className="table-row table-head">
              <span>ID</span>
              <span>EMPLOYEE</span>
              <span>ROLE</span>
              <span>DEPARTMENT</span>
              <span>STATUS</span>
            </div>

            {employees.length === 0 ? (
              <div className="empty-state">
                <span>00</span>

                <div>
                  <strong>No employees yet.</strong>
                  <p>Your employee directory is currently empty.</p>
                </div>
              </div>
            ) : (
              employees.map((employee) => (
                <div className="table-row employee-row" key={employee._id}>
                  <span className="employee-id">{employee.employeeId}</span>

                  <span className="employee-name">
                    {employee.name}
                    <small>{employee.email}</small>
                  </span>

                  <span>{employee.position}</span>

                  <span>{employee.department}</span>

                  <span className="row-actions">
                    <button
                      type="button"
                      onClick={() => handleViewEmployee(employee._id)}
                      className="action-link"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setEditingEmployee({ ...employee });
                        setMessage("");
                      }}
                      className="action-link"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className="action-link danger"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))
            )}

            {selectedEmployee && (
              <div className="employee-detail-panel">
                <div className="detail-header">
                  <div>
                    <p className="eyebrow">EMPLOYEE RECORD</p>
                    <h3>{selectedEmployee.name}</h3>
                  </div>

                  <button
                    type="button"
                    className="close-button"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="detail-grid">
                  <div>
                    <span>Employee ID</span>
                    <strong>{selectedEmployee.employeeId}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{selectedEmployee.email}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{selectedEmployee.phone}</strong>
                  </div>

                  <div>
                    <span>Position</span>
                    <strong>{selectedEmployee.position}</strong>
                  </div>

                  <div>
                    <span>Department</span>
                    <strong>{selectedEmployee.department}</strong>
                  </div>

                  <div>
                    <span>Salary</span>
                    <strong>₹{selectedEmployee.salary}</strong>
                  </div>

                  <div>
                    <span>Joining date</span>
                    <strong>
                      {new Date(
                        selectedEmployee.joiningDate,
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{selectedEmployee.status}</strong>
                  </div>
                </div>
              </div>
            )}

            {editingEmployee && (
              <div className="employee-detail-panel">
                <div className="detail-header">
                  <div>
                    <p className="eyebrow">EDIT RECORD</p>
                    <h3>{editingEmployee.name}</h3>
                  </div>

                  <button
                    type="button"
                    className="close-button"
                    onClick={() => setEditingEmployee(null)}
                  >
                    ×
                  </button>
                </div>

                <form className="employee-form" onSubmit={handleEditEmployee}>
                  <label>
                    Full name
                    <input
                      value={editingEmployee.name}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          name: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={editingEmployee.email}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          email: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      value={editingEmployee.phone}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          phone: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Position
                    <input
                      value={editingEmployee.position}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          position: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Department
                    <input
                      value={editingEmployee.department}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          department: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Salary
                    <input
                      type="number"
                      min="0"
                      value={editingEmployee.salary}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          salary: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Joining date
                    <input
                      type="date"
                      value={editingEmployee.joiningDate.slice(0, 10)}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          joiningDate: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={editingEmployee.status}
                      onChange={(event) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          status: event.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditingEmployee(null)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="save-button">
                      Save changes
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
