import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';

// Importação dos seus Models e Services
import 'models/usuario_model.dart';
import 'services/user_service.dart';

// Importação das suas telas
import 'home_screen.dart';
import 'atas_screen.dart';
import 'presenca_screen.dart';
import 'login_screen.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
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
        colorScheme: ColorScheme.fromSeed(seedColor: rosaOficial, primary: rosaOficial),
      ),
      // O StreamBuilder monitora se o usuário está logado ou não
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }

          if (snapshot.hasData && snapshot.data != null) {
            // Se estiver logado, buscamos o perfil (ADM/Sócio) no Firestore
            return FutureBuilder<UsuarioModel?>(
              future: UserService().getPerfil(snapshot.data!.uid),
              builder: (context, userSnapshot) {
                if (userSnapshot.connectionState == ConnectionState.waiting) {
                  return const Scaffold(body: Center(child: CircularProgressIndicator()));
                }

                if (userSnapshot.hasData && userSnapshot.data != null) {
                  // Entra no app com o perfil carregado
                  return MainNavigation(usuario: userSnapshot.data!);
                }

                // Se o usuário está no Auth mas não tem documento no Firestore
                return const LoginScreen(); 
              },
            );
          }
          // Se não estiver logado, vai para a tela de Login
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
    // Lista de telas passando o objeto 'usuario' para elas saberem o cargo
    final List<Widget> _screens = [
      HomeScreen(usuario: widget.usuario),
      const AtasScreen(), // Você pode passar o usuário aqui depois se precisar
      const PresencaScreen(),
      const Center(child: Text('Perfil em desenvolvimento')),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.description), label: 'Atas'),
          BottomNavigationBarItem(icon: Icon(Icons.check_circle), label: 'Presença'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}