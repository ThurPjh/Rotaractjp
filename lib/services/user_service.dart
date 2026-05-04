import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/usuario_model.dart';

class UserService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Busca os dados do usuário pelo UID
  Future<UsuarioModel?> getPerfil(String uid) async {
    try {
      var doc = await _db.collection('usuarios').doc(uid).get();
      if (doc.exists) {
        return UsuarioModel.fromFirestore(doc);
      }
    } catch (e) {
      print("Erro ao buscar perfil: $e");
    }
    return null;
  }
}