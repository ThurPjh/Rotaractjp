import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:rotaract_app/firebase_options.dart';

// Importação Models e Services
import 'package:rotaract_app/models/usuario_model.dart';
import 'package:rotaract_app/services/user_service.dart';

// Importação
import 'package:rotaract_app/screens/home_screen.dart';
import 'package:rotaract_app/screens/atas_screen.dart';
import 'package:rotaract_app/screens/login_screen.dart';
import 'package:rotaract_app/screens/perfil_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const RotaractApp());
}

class RotaractApp extends StatelessWidget {
  const RotaractApp({super.key});

  @override
  Widget build(BuildContext context) {
    const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

    return MaterialApp(
      title: 'Rotaract JP',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: rosaOficial,
          primary: rosaOficial,
        ),
      ),
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
    // Lista de telas principais
    final List<Widget> _screens = [
      HomeScreen(usuario: widget.usuario),
      const AtasScreen(),
      // Aba de Presença instrucional
      const Center(
        child: Padding(
          padding: EdgeInsets.all(20.0),
          child: Text(
            'Para realizar uma chamada, selecione um evento na aba Início.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      ),
      PerfilScreen(usuario: widget.usuario),
    ];

    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.description), label: 'Atas'),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: 'Presença',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}
