import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:rotaract_app/firebase_options.dart';
import 'package:provider/provider.dart'; 

// Importação Models e Services
import 'package:rotaract_app/models/usuario_model.dart';
import 'package:rotaract_app/services/user_service.dart';

// Importação das Screens
import 'package:rotaract_app/screens/home_screen.dart';
import 'package:rotaract_app/screens/atas_screen.dart';
import 'package:rotaract_app/screens/login_screen.dart';
import 'package:rotaract_app/screens/perfil_screen.dart';
import 'package:rotaract_app/screens/form_evento_screen.dart';
import 'package:rotaract_app/screens/eventos_screen.dart';
import 'package:rotaract_app/providers/theme_provider.dart'; 

// 1. Variável Global para controlar o tema
// ValueNotifier<ThemeMode> temaAtual = ValueNotifier(ThemeMode.light); // Removido, será gerenciado pelo ThemeProvider

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const RotaractApp());
}

class RotaractApp extends StatelessWidget {
  const RotaractApp({super.key});

  @override
  Widget build(BuildContext context) {
    // const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1); // Removido, temas estáticos em ThemeProvider

    // 2. ValueListenableBuilder envolve o MaterialApp para reconstruir ao mudar o tema
    return ChangeNotifierProvider(
      create: (_) => ThemeProvider(), // Instancia seu ThemeProvider
      child: Consumer<ThemeProvider>( // O Consumer reconstrói quando o tema muda
        builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Rotaract JP',
          debugShowCheckedModeBanner: false,
          
          // Configurações de Tema
            themeMode: themeProvider.themeMode, // Controlado pelo ThemeProvider
            theme: ThemeProvider.lightTheme, // Tema claro estático
            darkTheme: ThemeProvider.darkTheme, // Tema escuro estático
          home: StreamBuilder<User?>(
            stream: FirebaseAuth.instance.authStateChanges(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              }

              if (snapshot.hasData && snapshot.data != null) {
                return FutureBuilder<UsuarioModel?>(
                  future: UserService().getPerfil(snapshot.data!.uid),
                  builder: (context, userSnapshot) {
                    if (userSnapshot.connectionState == ConnectionState.waiting) {
                      return const Scaffold(
                        body: Center(child: CircularProgressIndicator()),
                      );
                    }

                    if (userSnapshot.hasData && userSnapshot.data != null) {
                      return MainNavigation(usuario: userSnapshot.data!);
                    }

                    return const LoginScreen();
                  },
                );
              }
              return const LoginScreen();
            },
          ),
        );
      },
      ),
                );
  }
}

class MainNavigation extends StatefulWidget {
  final UsuarioModel usuario;
  const MainNavigation({super.key, required this.usuario});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> _screens = [
      HomeScreen(usuario: widget.usuario), 
      AtasScreen(usuario: widget.usuario),
      const EventosScreen(),
      PerfilScreen(usuario: widget.usuario),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex, 
        children: _screens
      ),
      
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const FormEventoScreen()),
                );
              },
              backgroundColor: Theme.of(context).primaryColor,
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
          
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.black,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.description_outlined), label: 'Atas'),
          BottomNavigationBarItem(icon: Icon(Icons.check_circle_outline), label: 'Presença'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Perfil'),
        ],
      ),
    );
  }
}