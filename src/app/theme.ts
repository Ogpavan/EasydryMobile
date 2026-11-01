import { createTheme } from "@mui/material/styles";
import { colors, colorVariables } from "./colors";
export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primarySoft,
    },
    secondary: { main: colors.teal, light: colors.tealSoft },
    background: { default: colors.canvas, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.textSecondary },
    divider: colors.border,
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: 18, fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: 14, lineHeight: 1.6 },
    body2: { fontSize: 12, lineHeight: 1.5 },
    button: { fontSize: 14, fontWeight: 500, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: { styleOverrides: { ":root": colorVariables } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 48, borderRadius: 10, padding: "10px 18px" },
        contained: { minHeight: 52 },
        outlined: { borderColor: "#E1E8F1" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 48, minHeight: 48 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: "#fff",
          fontSize: 14,
          minHeight: 56,
        },
        notchedOutline: { borderColor: "#E1E8F1" },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, variant: "outlined" } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: "xs" },
      styleOverrides: { paper: { borderRadius: 16, margin: 20 } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 48,
          fontWeight: 500,
          fontSize: 13,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontSize: 11, height: 25, fontWeight: 500 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: 13,
          "&.MuiAlert-standard.MuiAlert-colorInfo": {
            backgroundColor: colors.neutralSoft,
            color: colors.neutralForeground,
            "& .MuiAlert-icon": { color: colors.neutralForeground },
          },
          "&.MuiAlert-standard.MuiAlert-colorSuccess": {
            backgroundColor: colors.successSoft,
            color: colors.tealDeep,
          },
          "&.MuiAlert-standard.MuiAlert-colorWarning": {
            backgroundColor: colors.goldSoft,
            color: colors.gold,
          },
        },
      },
    },
  },
});
