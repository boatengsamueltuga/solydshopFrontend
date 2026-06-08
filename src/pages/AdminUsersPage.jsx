import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Box,
    Button,
    Chip,
    Dialog as MuiDialog,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";

import CloseIcon      from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon     from "@mui/icons-material/Delete";

import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import confirmToast from "../utils/confirmToast";

const ROLE_COLORS = {
    ROLE_ADMIN:  "error",
    ROLE_SELLER: "warning",
    ROLE_USER:   "primary",
};

const AdminUsersPage = () => {

    const [users,        setUsers]        = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [isMobile,  setIsMobile]  = useState(window.innerWidth < 600);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
            setIsCompact(window.innerWidth < 1100);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchUsers = async () => {
        try {
            const response = await api.get("/admin/users");
            setUsers(response.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDeleteUser = (userId) => {
        confirmToast("Delete this user? This cannot be undone.", async () => {
            try {
                await api.delete(`/admin/users/${userId}`);
                toast.success("User deleted successfully");
                fetchUsers();
            } catch (error) {
                console.log(error);
                toast.error("Failed to delete user");
            }
        });
    };

    /*
    |----------------------------------------------------------
    | DataGrid Columns
    |----------------------------------------------------------
    */

    const columns = [

        {
            field: "userId",
            headerName: "ID",
            width: isMobile ? 55 : 70,
        },

        {
            field: "name",
            headerName: "Name",
            minWidth: isMobile ? 110 : 150,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {params.row.name}
                </span>
            ),
        },

        ...(!isCompact ? [{
            field: "email",
            headerName: "Email",
            minWidth: 180,
            flex: 1.2,
        }] : []),

        ...(!isMobile ? [{
            field: "roles",
            headerName: "Roles",
            width: 160,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 0.5 }}>
                    {params.row.roles?.map((role) => (
                        <Chip
                            key={role}
                            label={role.replace("ROLE_", "")}
                            color={ROLE_COLORS[role] || "default"}
                            size="small"
                            variant="filled"
                        />
                    ))}
                </Box>
            ),
        }] : []),

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 90 : 180,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewUser(params.row)}
                        sx={{ fontSize: isMobile ? "10px" : "12px" }}
                    >
                        View
                    </Button>
                    {!isMobile && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteUser(params.row.userId)}
                            sx={{ fontSize: "12px" }}
                        >
                            Delete
                        </Button>
                    )}
                </Box>
            ),
        },
    ];

    /*
    |----------------------------------------------------------
    | Loading
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Loader />
                <p className="text-2xl font-semibold mt-4">Loading users...</p>
            </div>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen w-full overflow-x-hidden">

            <div className="mb-6 md:mb-10">
                <h1 className="text-3xl md:text-5xl font-bold">User Management</h1>
                <p className="text-base text-gray-500 mt-2">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
            </div>

            <div
                className="bg-white rounded-xl shadow min-w-0"
                style={{ height: isMobile ? 450 : 600, width: "100%" }}
            >
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row.userId}
                    getRowHeight={() => "auto"}
                    disableRowSelectionOnClick
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "14px",
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px",
                        },
                    }}
                />
            </div>

            {/* ── User Detail Dialog ── */}
            <MuiDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedUser && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 3,
                                py: 2,
                                borderBottom: "2px solid",
                                borderColor: "secondary.main",
                                bgcolor: "#f5f0ff",
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" color="secondary.main">
                                User #{selectedUser.userId}
                            </Typography>
                            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ pt: 3 }}>
                            <Box
                                sx={{
                                    bgcolor: "#f5f0ff",
                                    border: "1px solid",
                                    borderColor: "secondary.light",
                                    borderLeft: "4px solid",
                                    borderLeftColor: "secondary.main",
                                    borderRadius: 2,
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                    <Box>
                                        <Typography variant="caption" color="secondary.main" fontWeight={700} textTransform="uppercase" letterSpacing={1}>User</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" fontSize="1.05rem">{selectedUser.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        {selectedUser.roles?.map((role) => (
                                            <Chip
                                                key={role}
                                                label={role.replace("ROLE_", "")}
                                                color={ROLE_COLORS[role] || "default"}
                                                size="small"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Divider />

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 55 }}>Email:</Typography>
                                    <Typography variant="body2" color="secondary.dark" fontWeight={500}>{selectedUser.email}</Typography>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                variant="outlined"
                                color="inherit"
                                startIcon={<CloseIcon />}
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    handleDeleteUser(selectedUser.userId);
                                }}
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                            >
                                Delete User
                            </Button>
                        </DialogActions>
                    </>
                )}
            </MuiDialog>

        </div>
    );
};

export default AdminUsersPage;
