import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import VisibilityIcon     from "@mui/icons-material/Visibility";
import DeleteIcon         from "@mui/icons-material/Delete";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SearchIcon         from "@mui/icons-material/Search";
import ClearIcon          from "@mui/icons-material/Clear";
import RefreshIcon        from "@mui/icons-material/Refresh";

import api           from "../api/api";
import toast         from "react-hot-toast";
import confirmToast  from "../utils/confirmToast";
import AdminLayout   from "../components/layouts/AdminLayout";
import SheetPanel    from "../components/common/SheetPanel";
import PageBanner    from "../components/common/PageBanner";

import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";

/* ── Constants ── */
const ROLE_TABS = ["ALL", "USERS", "SELLERS", "ADMINS"];

const ROLE_STYLE = {
    ROLE_ADMIN:  { color: "var(--accent-lo)", bg: "var(--accent-subtle)"  },
    ROLE_SELLER: { color: "var(--warning)",   bg: "var(--warning-subtle)" },
    ROLE_USER:   { color: "var(--info)",      bg: "var(--info-subtle)"    },
};

const RoleBadge = memo(({ role }) => {
    const s = ROLE_STYLE[role] ?? { color: "var(--text-3)", bg: "var(--surface-mid)" };
    return (
        <span style={{
            display:       "inline-block",
            padding:       "1px 7px",
            borderRadius:  "var(--r-sm)",
            background:    s.bg,
            color:         s.color,
            fontSize:      "11px",
            fontWeight:    600,
            fontFamily:    "var(--font-mono)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
        }}>
            {role.replace("ROLE_", "")}
        </span>
    );
});

/* ── AdminUsersPage ── */
const AdminUsersPage = () => {

    const [users,        setUsers]        = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSheetOpen,  setIsSheetOpen]  = useState(false);
    const [newRole,      setNewRole]      = useState("");
    const [activeTab,    setActiveTab]    = useState("ALL");
    const [search,       setSearch]       = useState("");

    const [isMobile,  setIsMobile]  = useState(window.innerWidth < 600);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const h = () => {
            setIsMobile(window.innerWidth < 600);
            setIsCompact(window.innerWidth < 1100);
        };
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    /*
    |----------------------------------------------------------
    | Filtered rows + tab counts
    |----------------------------------------------------------
    */

    const tabCounts = useMemo(() => ({
        ALL:     users.length,
        USERS:   users.filter(u => u.roles?.includes("ROLE_USER") && !u.roles?.includes("ROLE_ADMIN") && !u.roles?.includes("ROLE_SELLER")).length,
        SELLERS: users.filter(u => u.roles?.includes("ROLE_SELLER")).length,
        ADMINS:  users.filter(u => u.roles?.includes("ROLE_ADMIN")).length,
    }), [users]);

    const filteredUsers = useMemo(() => {
        let result;
        switch (activeTab) {
            case "USERS":   result = users.filter(u => u.roles?.includes("ROLE_USER") && !u.roles?.includes("ROLE_ADMIN") && !u.roles?.includes("ROLE_SELLER")); break;
            case "SELLERS": result = users.filter(u => u.roles?.includes("ROLE_SELLER")); break;
            case "ADMINS":  result = users.filter(u => u.roles?.includes("ROLE_ADMIN")); break;
            default:        result = users;
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [users, activeTab, search]);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewUser = useCallback((user) => {
        setSelectedUser(user);
        setNewRole(user.roles?.[0] ?? "ROLE_USER");
        setIsSheetOpen(true);
    }, []);

    const handleUpdateRole = async () => {
        try {
            await api.put(`/admin/users/${selectedUser.userId}/role?role=${newRole}`);
            toast.success("Role updated successfully");
            fetchUsers();
            setIsSheetOpen(false);
        } catch {
            toast.error("Failed to update role");
        }
    };

    const handleDeleteUser = useCallback((userId) => {
        confirmToast("Delete this user? This cannot be undone.", async () => {
            try {
                await api.delete(`/admin/users/${userId}`);
                toast.success("User deleted successfully");
                fetchUsers();
                setIsSheetOpen(false);
            } catch {
                toast.error("Failed to delete user");
            }
        });
    }, [fetchUsers]);

    /*
    |----------------------------------------------------------
    | DataGrid columns
    |----------------------------------------------------------
    */

    const columns = useMemo(() => [
        {
            field: "userId",
            headerName: "ID",
            width: isMobile ? 55 : 70,
            renderCell: (params) => (
                <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {params.row.userId}
                </span>
            ),
        },
        {
            field: "name",
            headerName: "Name",
            minWidth: isMobile ? 120 : 160,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)", fontSize: "13px", maxWidth: "100%", display: "block" }}>
                    {params.row.name}
                </span>
            ),
        },
        ...(!isCompact ? [{
            field: "email",
            headerName: "Email",
            minWidth: 180,
            flex: 1.2,
            renderCell: (params) => (
                <span style={{ color: "var(--text-2)", fontSize: "13px" }}>{params.row.email}</span>
            ),
        }] : []),
        ...(!isMobile ? [{
            field: "roles",
            headerName: "Roles",
            width: 180,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 0.5 }}>
                    {params.row.roles?.map(role => <RoleBadge key={role} role={role} />)}
                </Box>
            ),
        }] : []),
        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 80 : 120,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="View user" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleViewUser(params.row)}
                            sx={{ color: "var(--accent)", "&:hover": { background: "var(--accent-subtle)" } }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {!isMobile && (
                        <Tooltip title="Delete user" arrow>
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(params.row.userId)}
                                sx={{ color: "var(--error)", "&:hover": { background: "var(--error-subtle)" } }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ], [isMobile, isCompact, handleViewUser, handleDeleteUser]);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (
        <AdminLayout title="Users">

            {/* ── Page banner ── */}
            <div style={{ marginTop: "-24px", marginLeft: "-24px", marginRight: "-24px", marginBottom: "var(--space-5)" }}>
                <PageBanner
                    title="Users"
                    subtitle="Manage roles and account access"
                    icon={<PeopleOutlinedIcon sx={{ fontSize: 20 }} />}
                />
            </div>

            {/* ── Role tabs ── */}
            <div style={{
                display:      "flex",
                gap:          "4px",
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding:      "4px",
                marginBottom: "var(--space-4)",
                overflowX:    "auto",
                flexWrap:     "nowrap",
            }}>
                {ROLE_TABS.map(tab => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding:      "6px 12px",
                                borderRadius: "var(--r-sm)",
                                border:       "none",
                                background:   isActive ? "var(--surface-high)" : "transparent",
                                color:        isActive ? "var(--text)" : "var(--text-3)",
                                fontFamily:   "var(--font-body)",
                                fontSize:     "12px",
                                fontWeight:   isActive ? 600 : 400,
                                cursor:       "pointer",
                                whiteSpace:   "nowrap",
                                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                                transition:   "all var(--duration-fast)",
                                display:      "flex",
                                alignItems:   "center",
                                gap:          "6px",
                                flexShrink:   0,
                            }}
                        >
                            {tab}
                            <span style={{
                                fontSize:     "10px",
                                padding:      "1px 5px",
                                borderRadius: "var(--r-pill)",
                                background:   isActive ? "var(--accent-subtle)" : "var(--surface-hover)",
                                color:        isActive ? "var(--accent)" : "var(--text-4)",
                                fontFamily:   "var(--font-mono)",
                                fontWeight:   700,
                            }}>
                                {tabCounts[tab] ?? 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "var(--text-3)", fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 280, flex: 1, maxWidth: 480 }}
                />
                {search && (
                    <Tooltip title="Clear search" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setSearch("")}
                            sx={{ color: "var(--text-3)", "&:hover": { color: "var(--error)", background: "var(--error-subtle)" } }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Refresh" arrow>
                    <IconButton
                        onClick={() => { setLoading(true); fetchUsers(); }}
                        sx={{ color: "var(--text-3)", "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" } }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* ── DataGrid ── */}
            <div style={{
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                overflow:     "hidden",
            }}>
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    getRowId={(row) => row.userId}
                    rowHeight={56}
                    disableRowSelectionOnClick
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    style={{ height: isMobile ? 450 : 600, width: "100%", border: "none" }}
                />
            </div>

            {/* ── User Detail SheetPanel ── */}
            <SheetPanel
                open={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={`User #${selectedUser?.userId}`}
                subtitle={selectedUser?.email}
                footer={
                    <Stack direction="column" spacing={2}>
                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteUser(selectedUser?.userId)}
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                                Delete User
                            </Button>
                            <Button
                                onClick={handleUpdateRole}
                                variant="contained"
                                color="primary"
                                startIcon={<ManageAccountsIcon />}
                                sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}
                            >
                                Update Role
                            </Button>
                        </Stack>
                        <Button
                            onClick={() => setIsSheetOpen(false)}
                            variant="outlined"
                            fullWidth
                            sx={{ textTransform: "none" }}
                        >
                            Close
                        </Button>
                    </Stack>
                }
            >
                {selectedUser && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* User info card */}
                        <Box sx={{
                            background:   "var(--surface-high)",
                            border:       "1px solid var(--border)",
                            borderTop:    "3px solid var(--accent)",
                            borderRadius: "var(--r-md)",
                            p:            2,
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>User</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text)", mt: 0.25 }}>
                                        {selectedUser.name}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                    {selectedUser.roles?.map(role => <RoleBadge key={role} role={role} />)}
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--text)", minWidth: 55 }}>Email</Typography>
                                <Typography variant="body2" sx={{ color: "var(--accent)" }}>{selectedUser.email}</Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Role assignment */}
                        <Box>
                            <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 1.5 }}>
                                Assign Role
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    label="Role"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                                >
                                    <MenuItem value="ROLE_USER">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <RoleBadge role="ROLE_USER" />
                                            <Typography variant="body2" sx={{ color: "var(--text-2)" }}>Standard customer account</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="ROLE_SELLER">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <RoleBadge role="ROLE_SELLER" />
                                            <Typography variant="body2" sx={{ color: "var(--text-2)" }}>Can manage products</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="ROLE_ADMIN">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <RoleBadge role="ROLE_ADMIN" />
                                            <Typography variant="body2" sx={{ color: "var(--text-2)" }}>Full platform access</Typography>
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                    </Box>
                )}
            </SheetPanel>

        </AdminLayout>
    );
};

export default AdminUsersPage;
