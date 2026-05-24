import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';


const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  ThemeProvider() {
    _loadThemeMode();
  }

  void toggleTheme(bool isDarkMode) async {
    _themeMode = isDarkMode ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
    _saveThemeMode(isDarkMode);
  }

  void _loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final isDarkMode = prefs.getBool('isDarkMode') ?? false;
    _themeMode = isDarkMode ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }

  void _saveThemeMode(bool isDarkMode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', isDarkMode);
  }

  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: const Color.fromARGB(255, 255, 255, 255),
    colorScheme: const ColorScheme.light(
      //backghround do bagulho la em cima
      primary: Color.fromARGB(255, 255, 255, 255),
      onPrimary: rosaOficial,
      secondary: Colors.amber,
      surface: Colors.white,
      onSurface: Colors.black87,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: rosaOficial,
      foregroundColor: Colors.white,
    ),
    scaffoldBackgroundColor: Colors.white,
    cardColor: Colors.white,
    textTheme: const TextTheme(
      titleMedium: TextStyle(color: Colors.black, fontSize: 16), // Garante o estilo do título
      bodyMedium: TextStyle(color: Colors.black54, fontSize: 14), // Garante o estilo do subtítulo
    ),
    listTileTheme: const ListTileThemeData(
      iconColor: Colors.black54,
    ),
    dividerTheme: const DividerThemeData(
      color: Colors.black12,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: rosaOficial,
    colorScheme: const ColorScheme.dark(
      primary: rosaOficial,
      onPrimary: Colors.white,
      secondary: Colors.teal,
      surface: Color(0xFF121212),
      onSurface: Colors.white70,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color.fromRGBO(212, 19, 103, 1),
      foregroundColor: Colors.white,
    ),
    // CORREÇÃO: Removido o uso de colchetes [] em propriedades estáticas
    scaffoldBackgroundColor: const Color(0xFF212121), // Equivalente ao Colors.grey[900]
    cardColor: const Color(0xFF303030), // Equivalente ao Colors.grey[850]
    textTheme: const TextTheme(
      titleMedium: TextStyle(color: Colors.white, fontSize: 16), // Texto claro no modo escuro
      bodyMedium: TextStyle(color: Colors.white60, fontSize: 14), // Texto secundário claro
    ),
    listTileTheme: const ListTileThemeData(
      iconColor: Colors.white70,
    ),
    dividerTheme: const DividerThemeData(
      color: Colors.white12,
    ),
  );
}