import 'package:cloud_firestore/cloud_firestore.dart';

class UsuarioModel {
  final String uid;
  final String nome;
  final String email;
  final String cargo;

  UsuarioModel({
    required this.uid,
    required this.nome,
    required this.email,
    required this.cargo,
  });

  factory UsuarioModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    return UsuarioModel(
      uid: doc.id,
      nome: data['nome'] ?? '',
      email: data['email'] ?? '',
      cargo: data['cargo'] ?? 'sócio', 
    );
  }
}